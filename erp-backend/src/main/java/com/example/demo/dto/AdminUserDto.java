package com.example.demo.dto;

import com.example.demo.entity.Member;
import com.example.demo.entity.MemberRole;
import java.time.LocalDateTime;

public record AdminUserDto(
        Long id,
        String name,
        String email,
        MemberRole role,
        LocalDateTime createdAt
) {
    public static AdminUserDto from(Member member) {
        return new AdminUserDto(
                member.getId(),
                member.getLastName() + member.getFirstName(),
                member.getEmail(),
                member.getRole(),
                member.getCreatedAt()
        );
    }
}
