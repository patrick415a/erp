package com.example.demo.dto;

import com.example.demo.entity.Member;

public record MemberProfileDto (
        Long id,
        String firstName,
        String lastName,
        String email,
        String companyName,
        String position,
        String tel,
        String address,
        String detailAddress
) {
    public static MemberProfileDto from(Member member) {
        return new MemberProfileDto(
                member.getId(),
                member.getFirstName(),
                member.getLastName(),
                member.getEmail(),
                member.getCompanyName(),
                member.getPosition(),
                member.getTel(),
                member.getAddress(),
                member.getDetailAddress()
        );
    }
}

