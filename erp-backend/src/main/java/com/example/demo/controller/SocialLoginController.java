package com.example.demo.controller;

import com.example.demo.dto.TokenResponseDto;
import com.example.demo.service.SocialLoginService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/members/oauth")
@RequiredArgsConstructor
public class SocialLoginController {

    private static final int MAX_PENDING_ATTEMPTS = 2000;
    private final SocialLoginService socialLogin;
    private final Map<String, SocialLoginService.Attempt> attempts = new HashMap<>();

    @PostMapping("/{provider}/authorize")
    public Map<String, String> authorize(
        @PathVariable("provider") String provider,
        @RequestHeader("Origin") String origin
    ) {
        var authorization = socialLogin.start(provider, origin);
        synchronized (attempts) {
            Instant now = Instant.now();
            attempts.values().removeIf(attempt -> !attempt.expiresAt().isAfter(now));
            if (attempts.size() >= MAX_PENDING_ATTEMPTS) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS);
            }
            attempts.put(authorization.attempt().state(), authorization.attempt());
        }
        return Map.of("authorizationUrl", authorization.url().toString(), "verifier", authorization.attempt().verifier());
    }

    @PostMapping("/complete")
    public TokenResponseDto complete(@RequestBody Callback callback, @RequestHeader("Origin") String origin) {
        String redirectUri = socialLogin.redirectForBrowserOrigin(origin);
        if (
            callback.code() == null ||
            callback.code().isBlank() ||
            callback.code().length() > 2048 ||
            callback.state() == null || callback.state().length() != 43 ||
            callback.verifier() == null || callback.verifier().length() != 43
        ) {
            throw invalidAttempt();
        }

        SocialLoginService.Attempt attempt;
        synchronized (attempts) {
            attempt = attempts.get(callback.state());
            if (
                attempt == null || !attempt.expiresAt().isAfter(Instant.now()) ||
                !attempt.redirectUri().equals(redirectUri) ||
                !MessageDigest.isEqual(attempt.verifier().getBytes(StandardCharsets.UTF_8),
                    callback.verifier().getBytes(StandardCharsets.UTF_8))
            ) {
                throw invalidAttempt();
            }
            attempts.remove(callback.state());
        }
        return new TokenResponseDto(socialLogin.login(attempt, callback.code()));
    }

    private ResponseStatusException invalidAttempt() {
        return new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "소셜 로그인 요청이 만료되었습니다. 처음부터 다시 시도해 주세요."
        );
    }

    public record Callback(String code, String state, String verifier) {}
}
