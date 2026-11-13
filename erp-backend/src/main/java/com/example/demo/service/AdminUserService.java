package com.example.demo.service;

import com.example.demo.dto.AdminUserDto;
import com.example.demo.entity.Member;
import com.example.demo.entity.MemberRole;
import com.example.demo.entity.Permission;
import com.example.demo.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Arrays;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final MemberRepository memberRepository;
    private final RolePermissionService permissions;

    // 전체 회원 목록 조회
    @Transactional(readOnly = true)
    public List<AdminUserDto> getAllUsers(Member actor) {
        Set<Permission> actorPermissions = permissions.permissionsFor(actor.getRole());
        List<MemberRole> assignableRoles = actorPermissions.contains(Permission.USERS_UPDATE)
                ? Arrays.stream(MemberRole.values()).filter(role -> canAssign(actor, actorPermissions, role)).toList()
                : List.of();
        return memberRepository.findAll().stream()
                .map(member -> AdminUserDto.from(member,
                        actor.getId().equals(member.getId()) || (member.getRole() != null && !assignableRoles.contains(member.getRole()))
                                ? List.of() : assignableRoles))
                .toList();
    }

    // 회원 권한 변경
    @Transactional
    public void updateUserRole(
            Member actor,
            Long userId,
            MemberRole newRole
    ) {
        if (newRole == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "변경할 권한을 선택해 주세요.");
        }
        if (actor.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "자신의 권한은 변경할 수 없습니다.");
        }
        List<Member> lockedMembers = memberRepository.lockForRoleUpdate(List.of(actor.getId(), userId));
        Member currentActor = lockedMembers.stream().filter(member -> member.getId().equals(actor.getId())).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
        Member target = lockedMembers.stream().filter(member -> member.getId().equals(userId)).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
        Set<Permission> actorPermissions = permissions.permissionsFor(currentActor.getRole());
        if (!actorPermissions.contains(Permission.USERS_UPDATE)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "사용자 권한 변경 권한이 필요합니다.");
        }
        if (!canAssign(currentActor, actorPermissions, target.getRole())
                || !canAssign(currentActor, actorPermissions, newRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "현재 권한 범위 내에서 사용자 역할을 변경해 주세요.");
        }

        target.changeRole(newRole);
    }

    private boolean canAssign(Member actor, Set<Permission> actorPermissions, MemberRole role) {
        return actor.getRole() == MemberRole.SYSTEM_ADMIN
                || (role != MemberRole.SYSTEM_ADMIN && actorPermissions.containsAll(permissions.permissionsFor(role)));
    }
}
