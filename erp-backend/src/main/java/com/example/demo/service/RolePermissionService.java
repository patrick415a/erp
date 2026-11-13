package com.example.demo.service;

import com.example.demo.entity.MemberRole;
import com.example.demo.entity.Permission;
import com.example.demo.entity.RolePermissionPolicy;
import com.example.demo.repository.RolePermissionPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import static com.example.demo.entity.Permission.*;

@Service
@RequiredArgsConstructor
public class RolePermissionService {
    private final RolePermissionPolicyRepository repository;

    @Transactional(readOnly = true)
    public Set<Permission> permissionsFor(MemberRole role) {
        return role == null ? Set.of() : policyFor(role).permissions();
    }

    @Transactional(readOnly = true)
    public List<RolePolicy> listPolicies() {
        return Arrays.stream(MemberRole.values()).map(this::policyFor).toList();
    }

    @Transactional
    public RolePolicy savePolicy(MemberRole role, Set<Permission> requested, Long version) {
        if (requested == null || requested.stream().anyMatch(Objects::isNull)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "저장할 권한을 확인해 주세요.");
        }
        if (!requested.containsAll(requiredFor(role))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "시스템 관리자의 기준정보 조회 권한은 유지해야 합니다.");
        }
        for (Permission permission : requested) {
            if (permission.prerequisite() != null && !requested.contains(permission.prerequisite())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "해당 기능의 조회 권한을 먼저 선택해 주세요.");
            }
        }

        RolePermissionPolicy policy = repository.findById(role).orElseGet(() -> new RolePermissionPolicy(role));
        if (!Objects.equals(policy.getVersion(), version)) throw policyConflict();
        policy.replacePermissions(requested);
        try {
            return toPolicy(repository.saveAndFlush(policy));
        } catch (OptimisticLockingFailureException | DataIntegrityViolationException error) {
            throw policyConflict();
        }
    }

    private RolePolicy policyFor(MemberRole role) {
        return repository.findById(role)
                .map(this::toPolicy)
                .orElseGet(() -> new RolePolicy(role, defaultPermissions(role), requiredFor(role), null));
    }

    private RolePolicy toPolicy(RolePermissionPolicy policy) {
        return new RolePolicy(policy.getRole(), Set.copyOf(policy.getPermissions()),
                requiredFor(policy.getRole()), policy.getVersion());
    }

    private static Set<Permission> requiredFor(MemberRole role) {
        return role == MemberRole.SYSTEM_ADMIN ? Set.of(SETTINGS_VIEW) : Set.of();
    }

    private static Set<Permission> defaultPermissions(MemberRole role) {
        return switch (role) {
            case SYSTEM_ADMIN -> EnumSet.allOf(Permission.class);
            case PRODUCTION_MANAGER -> EnumSet.of(DASHBOARD_VIEW, PRODUCTION_VIEW, PRODUCTION_CREATE,
                    PRODUCTION_UPDATE, PRODUCTION_DELETE, INVENTORY_VIEW,
                    CALENDAR_VIEW, CALENDAR_CREATE, CALENDAR_UPDATE, CALENDAR_DELETE);
            case EMPLOYEE -> EnumSet.of(DASHBOARD_VIEW, PRODUCTION_VIEW,
                    CALENDAR_VIEW, CALENDAR_CREATE, CALENDAR_UPDATE, CALENDAR_DELETE);
        };
    }

    private static ResponseStatusException policyConflict() {
        return new ResponseStatusException(HttpStatus.CONFLICT, "다른 곳에서 권한 설정이 변경되었습니다. 목록을 다시 불러온 뒤 저장해 주세요.");
    }

    public record RolePolicy(MemberRole role, Set<Permission> permissions, Set<Permission> required, Long version) {}
}
