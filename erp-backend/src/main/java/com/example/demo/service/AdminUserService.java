package com.example.demo.service;

import com.example.demo.dto.AdminUserDto;
import com.example.demo.entity.Member;
import com.example.demo.entity.MemberRole;
import com.example.demo.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final MemberRepository memberRepository;

    // 현재 로그인한 사용자가 시스템 관리자인지 확인
    @Transactional(readOnly = true)
    public Member requireAdmin(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        Member admin = memberRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        if (admin.getRole() != MemberRole.SYSTEM_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 권한이 필요합니다.");
        }

        return admin;
    }

    // 전체 회원 목록 조회
    @Transactional(readOnly = true)
    public List<AdminUserDto> getAllUsers(String adminEmail) {
        requireAdmin(adminEmail);

        return memberRepository.findAll().stream().map(AdminUserDto::from).toList();
    }

    // 회원 권한 변경
    @Transactional
    public void updateUserRole(
            String adminEmail,
            Long userId,
            MemberRole newRole
    ) {
        Member admin = requireAdmin(adminEmail);

        Member target = memberRepository.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));

        // 관리자가 자신의 권한을 변경하는 상황 방지
        if (admin.getId().equals(target.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "자신의 관리자 권한은 변경할 수 없습니다.");
        }

        // 마지막 시스템 관리자 계정 보호는 추후 추가
        target.changeRole(newRole);
    }
}
