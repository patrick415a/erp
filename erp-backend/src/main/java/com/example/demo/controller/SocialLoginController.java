package com.example.demo.controller;

import com.example.demo.dto.TokenResponseDto;
import com.example.demo.service.SocialLoginService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.time.Instant;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.WebUtils;

@RestController
@RequestMapping("/api/members/oauth")
@RequiredArgsConstructor
public class SocialLoginController {

    private static final String LOGIN_ATTEMPT = "erp.socialLoginAttempt";
    private final SocialLoginService socialLogin;

    @PostMapping("/{provider}/authorize")
    public Map<String, String> authorize(
        @PathVariable("provider") String provider,
        @RequestHeader("Origin") String origin,
        HttpSession session
    ) {
        var authorization = socialLogin.start(provider, origin);
        synchronized (WebUtils.getSessionMutex(session)) {
            session.setAttribute(LOGIN_ATTEMPT, authorization.attempt());
        }
        return Map.of("authorizationUrl", authorization.url().toString());
    }

    @PostMapping("/complete")
    public TokenResponseDto complete(@RequestBody Callback callback, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (
            session == null ||
            callback.code() == null ||
            callback.code().isBlank() ||
            callback.code().length() > 2048 ||
            callback.state() == null
        ) {
            throw invalidAttempt();
        }

        SocialLoginService.Attempt attempt;
        synchronized (WebUtils.getSessionMutex(session)) {
            if (
                !(session.getAttribute(LOGIN_ATTEMPT) instanceof SocialLoginService.Attempt pending) ||
                !pending.state().equals(callback.state()) ||
                !pending.expiresAt().isAfter(Instant.now())
            ) {
                throw invalidAttempt();
            }
            attempt = pending;
            session.removeAttribute(LOGIN_ATTEMPT);
        }
        return new TokenResponseDto(socialLogin.login(attempt, callback.code()));
    }

    private ResponseStatusException invalidAttempt() {
        return new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "소셜 로그인 요청이 만료되었습니다. 처음부터 다시 시도해 주세요."
        );
    }

    public record Callback(String code, String state) {}
}
