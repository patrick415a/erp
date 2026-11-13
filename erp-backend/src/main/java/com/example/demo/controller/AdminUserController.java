package com.example.demo.controller;

import com.example.demo.dto.AdminUserDto;
import com.example.demo.entity.Member;
import com.example.demo.entity.MemberRole;
import com.example.demo.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService adminUserService;

    @GetMapping
    public List<AdminUserDto> getUsers(@AuthenticationPrincipal Member actor) {
        return adminUserService.getAllUsers(actor);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<Void> updateRole(@AuthenticationPrincipal Member actor, @PathVariable Long id,
            @RequestBody UpdateRoleRequest request) {
        adminUserService.updateUserRole(actor, id, request.role());
        return ResponseEntity.noContent().build();
    }

    public record UpdateRoleRequest(MemberRole role) {}
}
