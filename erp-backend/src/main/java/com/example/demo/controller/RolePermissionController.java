package com.example.demo.controller;

import com.example.demo.entity.Member;
import com.example.demo.entity.MemberRole;
import com.example.demo.entity.Permission;
import com.example.demo.service.RolePermissionService;
import com.example.demo.service.RolePermissionService.RolePolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.util.List;
import java.util.Set;

@RestController
@RequiredArgsConstructor
public class RolePermissionController {
    private final RolePermissionService service;

    @GetMapping("/api/access")
    public CurrentAccess currentAccess(@AuthenticationPrincipal Member member) {
        return new CurrentAccess(member.getRole(), service.permissionsFor(member.getRole()));
    }

    @GetMapping("/api/settings/permissions")
    public List<RolePolicy> listPolicies() {
        return service.listPolicies();
    }

    @PutMapping("/api/settings/permissions/{role}")
    public RolePolicy savePolicy(@PathVariable MemberRole role, @RequestBody SavePolicy input) {
        return service.savePolicy(role, input.permissions(), input.version());
    }

    @GetMapping("/api/settings/system")
    public SystemEnvironment systemEnvironment() {
        return new SystemEnvironment(ZoneId.systemDefault().getId());
    }

    public record CurrentAccess(MemberRole role, Set<Permission> permissions) {}
    public record SavePolicy(Set<Permission> permissions, Long version) {}
    public record SystemEnvironment(String timeZone) {}
}
