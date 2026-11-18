package com.example.demo.service;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.Properties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Service
@Slf4j
public class GmailMailService {

    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
    private static final ParameterizedTypeReference<Map<String, Object>> TOKEN_BODY =
        new ParameterizedTypeReference<>() {};

    private final String clientId;
    private final String clientSecret;
    private final String refreshToken;
    private final String sender;
    private final RestClient client;

    public GmailMailService(
        @Value("${ERP_GMAIL_CLIENT_ID:}") String clientId,
        @Value("${ERP_GMAIL_CLIENT_SECRET:}") String clientSecret,
        @Value("${ERP_GMAIL_REFRESH_TOKEN:}") String refreshToken,
        @Value("${ERP_GMAIL_SENDER:}") String sender
    ) {
        this.clientId = clientId.strip();
        this.clientSecret = clientSecret.strip();
        this.refreshToken = refreshToken.strip();
        this.sender = sender.strip();

        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(8000);
        this.client = RestClient.builder().requestFactory(requestFactory).build();
    }

    public void send(String recipient, String subject, String body) {
        if (clientId.isEmpty() || clientSecret.isEmpty() || refreshToken.isEmpty() || sender.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE, "메일 발송 설정이 준비되지 않았습니다."
            );
        }

        String raw = encodeMessage(recipient, subject, body);
        try {
            String accessToken = exchangeRefreshToken();
            client.post()
                .uri(SEND_URL)
                .headers(headers -> headers.setBearerAuth(accessToken))
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("raw", raw))
                .retrieve()
                .toBodilessEntity();
        } catch (RestClientException e) {
            if (e instanceof RestClientResponseException response) {
                log.warn("Gmail API request failed with HTTP {}", response.getStatusCode().value());
            } else {
                log.warn("Gmail API request failed ({})", e.getClass().getSimpleName());
            }
            throw new ResponseStatusException(
                HttpStatus.BAD_GATEWAY, "메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요."
            );
        }
    }

    private String exchangeRefreshToken() {
        var form = new LinkedMultiValueMap<String, String>();
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("refresh_token", refreshToken);
        form.add("grant_type", "refresh_token");

        var response = client.post()
            .uri(TOKEN_URL)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(form)
            .retrieve()
            .body(TOKEN_BODY);
        if (response == null || !(response.get("access_token") instanceof String token) || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "메일 발송 권한을 확인하지 못했습니다.");
        }
        return token;
    }

    private String encodeMessage(String recipient, String subject, String body) {
        try {
            var message = new MimeMessage(Session.getInstance(new Properties()));
            message.setFrom(new InternetAddress(sender, true));
            message.setRecipient(Message.RecipientType.TO, new InternetAddress(recipient, true));
            message.setSubject(subject, StandardCharsets.UTF_8.name());
            message.setText(body, StandardCharsets.UTF_8.name());
            var bytes = new ByteArrayOutputStream();
            message.writeTo(bytes);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes.toByteArray());
        } catch (MessagingException | IOException e) {
            log.warn("Could not encode the Gmail message ({})", e.getClass().getSimpleName());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "메일을 준비하지 못했습니다.");
        }
    }
}
