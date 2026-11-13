package com.example.demo.dto;

import com.example.demo.entity.Member;
import com.example.demo.entity.MemberRole;
import java.time.LocalDateTime;
import java.util.List;

public record AdminUserDto(
        Long id,
        String name,
        String email,
        MemberRole role,
        LocalDateTime createdAt,
        List<MemberRole> assignableRoles
) {
    public static AdminUserDto from(Member member, List<MemberRole> assignableRoles) {
        return new AdminUserDto(
                member.getId(),
                member.getLastName() + member.getFirstName(),
                member.getEmail(),
                member.getRole(),
                member.getCreatedAt(),
                assignableRoles
        );
    }
}
