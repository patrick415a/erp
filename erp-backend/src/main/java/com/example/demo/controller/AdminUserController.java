package com.example.demo.controller;

import com.example.demo.config.JwtProvider;
import com.example.demo.dto.AdminUserDto;
import com.example.demo.entity.MemberRole;
import com.example.demo.service.AdminUserService;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService adminUserService;
    private final JwtProvider jwtProvider;

    //JWT 검증 후 로그인한 회원 이메일 반환
    private String getLoginEmail(String authorization) {
        if (authorization == null || !authorization.regionMatches(true, 0, "Bearer ", 0, 7)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        try {
            String email = jwtProvider.getEmailFromToken(authorization.substring(7).trim());

            if (email == null || email.isBlank()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
            }

            return email;
        } catch (JwtException | IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 만료되었습니다.");
        }
    }

    //전체 회원 목록 조회
    @GetMapping
    public ResponseEntity<List<AdminUserDto>> getUsers(@RequestHeader(value = "Authorization", required = false) String authorization) {
        String email = getLoginEmail(authorization);

        return ResponseEntity.ok(adminUserService.getAllUsers(email));
    }

    //회원 권한 변경
    @PutMapping("/{id}/role")
    public ResponseEntity<String> updateRole(@RequestHeader(value = "Authorization", required = false) String authorization, @PathVariable Long id, @RequestBody UpdateRoleRequest request) {
        String email = getLoginEmail(authorization);

        adminUserService.updateUserRole(email, id, request.role());

        return ResponseEntity.ok("사용자 권한이 변경되었습니다.");
    }

    public record UpdateRoleRequest(MemberRole role) {}
}
