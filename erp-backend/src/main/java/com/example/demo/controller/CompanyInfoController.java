package com.example.demo.controller;

import com.example.demo.config.JwtProvider;
import com.example.demo.dto.CompanyInfoDto;
import com.example.demo.service.CompanyInfoService;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/settings/company")
@RequiredArgsConstructor
public class CompanyInfoController {
    private final CompanyInfoService service;
    private final JwtProvider jwtProvider;

    @GetMapping
    public CompanyInfoDto get(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireLogin(authorization);
        return service.get();
    }

    @PutMapping
    public CompanyInfoDto save(
        @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
        @RequestBody CompanyInfoDto company
    ) {
        requireLogin(authorization);
        return service.save(company);
    }

    private void requireLogin(String authorization) {
        if (authorization == null || !authorization.regionMatches(true, 0, "Bearer ", 0, 7)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        try {
            String email = jwtProvider.getEmailFromToken(authorization.substring(7));
            if (email != null && !email.isBlank()) return;
        } catch (JwtException | IllegalArgumentException error) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 만료되었습니다.", error);
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
    }
}
