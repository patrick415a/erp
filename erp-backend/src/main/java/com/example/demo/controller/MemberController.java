package com.example.demo.controller;

import com.example.demo.config.JwtProvider;
import com.example.demo.dto.MemberLoginDto;
import com.example.demo.dto.MemberRegisterDto;
import com.example.demo.dto.MemberUpdateDto;
import com.example.demo.dto.PasswordChangeDto;
import com.example.demo.dto.TokenResponseDto;
import com.example.demo.service.MemberService;
import com.example.demo.dto.MemberProfileDto;
import io.jsonwebtoken.JwtException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MemberController {

    private final MemberService memberService;
    private final JwtProvider jwtProvider;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody MemberRegisterDto requestDto) {
        try {
            memberService.register(requestDto);
            return ResponseEntity.ok("회원가입 성공");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("회원가입 처리 중 오류가 발생했습니다.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody MemberLoginDto requestDto) {
        try {
            String token = memberService.login(requestDto);
            return ResponseEntity.ok(new TokenResponseDto(token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("로그인 처리 중 오류가 발생했습니다.");
        }
    }

    // 비밀번호 찾기 (임시 비밀번호 발송)
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            memberService.sendTempPassword(request.get("email"));
            return ResponseEntity.ok("임시 비밀번호가 이메일로 발송되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 비밀번호 변경 (마이페이지용)
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestBody PasswordChangeDto dto
    ) {
        if (authorization == null || !authorization.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        String email;
        try {
            email = jwtProvider.getEmailFromToken(authorization.substring(7));
        } catch (JwtException | IllegalArgumentException e) {
            return ResponseEntity.status(401).body("로그인이 만료되었습니다.");
        }
        if (email == null || email.isBlank()) return ResponseEntity.status(401).body("로그인이 필요합니다.");

        try {
            memberService.changePassword(email, dto.getOldPassword(), dto.getNewPassword());
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //마이페이지 - 로그인한 회원정보 조회
    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile(@RequestHeader(value = "Authorization", required = false) String authorization) {
        //토큰 존재 여부 및 Bearer 형식 확인
        if (authorization == null || !authorization.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        try {
            //JWT에서 로그인한 회원의 이메일 추출
            String token = authorization.substring(7);
            String email = jwtProvider.getEmailFromToken(token);

            if (email == null || email.isBlank()) {
                return ResponseEntity.status(401).body("로그인이 필요합니다.");
            }

            //DB에서 회원정보 조회
            MemberProfileDto profile = memberService.getMyProfile(email);

            return ResponseEntity.ok(profile);
        } catch (JwtException | IllegalArgumentException e) {
            return ResponseEntity.status(401).body("로그인이 만료되었습니다.");
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestBody MemberUpdateDto profile
    ) {
        if (authorization == null || !authorization.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        String email;
        try {
            email = jwtProvider.getEmailFromToken(authorization.substring(7));
        } catch (JwtException | IllegalArgumentException e) {
            return ResponseEntity.status(401).body("로그인이 만료되었습니다.");
        }
        if (email == null || email.isBlank()) return ResponseEntity.status(401).body("로그인이 필요합니다.");

        memberService.updateProfile(email, profile);
        return ResponseEntity.ok("회원 정보를 수정했습니다.");
    }
}
