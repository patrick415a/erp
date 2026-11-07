package com.example.demo.service;

import java.net.URI;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class SocialLoginService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final ParameterizedTypeReference<Map<String, Object>> JSON =
        new ParameterizedTypeReference<>() {};

    private final MemberService members;
    private final RestClient client;
    private final String redirectUri;
    private final Provider google;
    private final Provider kakao;

    public SocialLoginService(
        MemberService members,
        @Value("${ERP_OAUTH_REDIRECT_URI:http://localhost:3000/}") String redirectUri,
        @Value("${ERP_GOOGLE_CLIENT_ID:}") String googleId,
        @Value("${ERP_GOOGLE_CLIENT_SECRET:}") String googleSecret,
        @Value("${ERP_KAKAO_CLIENT_ID:}") String kakaoId,
        @Value("${ERP_KAKAO_CLIENT_SECRET:}") String kakaoSecret
    ) {
        this.members = members;
        this.redirectUri = redirectUri;
        this.google = new Provider(
            "google",
            googleId,
            googleSecret,
            "https://accounts.google.com/o/oauth2/v2/auth",
            "https://oauth2.googleapis.com/token",
            "https://openidconnect.googleapis.com/v1/userinfo",
            "openid email profile"
        );
        this.kakao = new Provider(
            "kakao",
            kakaoId,
            kakaoSecret,
            "https://kauth.kakao.com/oauth/authorize",
            "https://kauth.kakao.com/oauth/token",
            "https://kapi.kakao.com/v2/user/me",
            "account_email"
        );

        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(8000);
        this.client = RestClient.builder().requestFactory(requestFactory).build();
    }

    public Authorization start(String providerName, String browserOrigin) {
        Provider provider = getProvider(providerName);
        String expectedOrigin = UriComponentsBuilder.fromUriString(redirectUri)
            .replacePath(null)
            .replaceQuery(null)
            .fragment(null)
            .build()
            .toUriString();
        if (!expectedOrigin.equals(browserOrigin)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "로그인 화면 주소와 리디렉션 설정이 일치하지 않습니다."
            );
        }

        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String state = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        URI authorizationUrl = UriComponentsBuilder.fromUriString(provider.authorizeUrl())
            .queryParam("client_id", "{clientId}")
            .queryParam("redirect_uri", "{redirectUri}")
            .queryParam("response_type", "code")
            .queryParam("scope", "{scope}")
            .queryParam("state", state)
            .encode()
            .buildAndExpand(provider.clientId(), redirectUri, provider.scope())
            .toUri();

        return new Authorization(
            authorizationUrl,
            new Attempt(provider.name(), state, Instant.now().plusSeconds(600))
        );
    }

    public String login(Attempt attempt, String code) {
        Provider provider = getProvider(attempt.provider());
        var form = new LinkedMultiValueMap<String, String>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", provider.clientId());
        if (!provider.clientSecret().isBlank()) form.add("client_secret", provider.clientSecret());
        form.add("redirect_uri", redirectUri);
        form.add("code", code);

        Map<String, Object> user;
        try {
            Map<String, Object> token = client
                .post()
                .uri(provider.tokenUrl())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(JSON);
            if (
                token == null ||
                !(token.get("access_token") instanceof String accessToken) ||
                accessToken.isBlank()
            ) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "소셜 로그인 토큰을 받지 못했습니다."
                );
            }

            user = client
                .get()
                .uri(provider.userInfoUrl())
                .headers(headers -> headers.setBearerAuth(accessToken))
                .retrieve()
                .body(JSON);
        } catch (RestClientException e) {
            throw new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "소셜 로그인 제공자와 통신하지 못했습니다."
            );
        }

        if (user == null) throw new ResponseStatusException(
            HttpStatus.BAD_GATEWAY,
            "계정 정보를 받지 못했습니다."
        );
        SocialAccount account = provider == google ? googleAccount(user) : kakaoAccount(user);
        return members.loginWithProvider(provider.name(), account.subject(), account.email(), account.name());
    }

    private SocialAccount googleAccount(Map<String, Object> user) {
        String subject = user.get("sub") instanceof String value ? value : null;
        return verifiedAccount(
            subject,
            user.get("email"),
            user.get("name"),
            Boolean.TRUE.equals(user.get("email_verified"))
        );
    }

    private SocialAccount kakaoAccount(Map<String, Object> user) {
        if (
            !(user.get("id") instanceof Number id) ||
            !(user.get("kakao_account") instanceof Map<?, ?> account)
        ) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Kakao 계정의 이메일 정보가 필요합니다."
            );
        }
        Object nickname = account.get("profile") instanceof Map<?, ?> profile
            ? profile.get("nickname")
            : null;
        return verifiedAccount(
            id.toString(),
            account.get("email"),
            nickname,
            Boolean.TRUE.equals(account.get("is_email_verified")) &&
            Boolean.TRUE.equals(account.get("is_email_valid"))
        );
    }

    private SocialAccount verifiedAccount(String subject, Object email, Object name, boolean verified) {
        if (
            !verified ||
            subject == null ||
            subject.isBlank() ||
            !(email instanceof String address) ||
            address.isBlank()
        ) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "인증된 이메일을 제공하는 계정으로 로그인해 주세요."
            );
        }
        return new SocialAccount(
            subject,
            address,
            name instanceof String displayName ? displayName : address.split("@", 2)[0]
        );
    }

    private Provider getProvider(String name) {
        Provider provider = switch (name) {
            case "google" -> google;
            case "kakao" -> kakao;
            default -> throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "지원하지 않는 소셜 로그인입니다."
            );
        };
        if (provider.clientId().isBlank() || (provider == google && provider.clientSecret().isBlank())) {
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "소셜 로그인 서버 설정이 필요합니다."
            );
        }
        return provider;
    }

    private record Provider(
        String name,
        String clientId,
        String clientSecret,
        String authorizeUrl,
        String tokenUrl,
        String userInfoUrl,
        String scope
    ) {}

    private record SocialAccount(String subject, String email, String name) {}

    public record Attempt(String provider, String state, Instant expiresAt) implements java.io.Serializable {}

    public record Authorization(URI url, Attempt attempt) {}
}
