package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "ROLE_PERMISSION_POLICY")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RolePermissionPolicy {
    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE_NAME", length = 30)
    private MemberRole role;

    @Version
    private Long version;

    @ElementCollection
    @CollectionTable(name = "ROLE_PERMISSION_GRANT", joinColumns = @JoinColumn(name = "ROLE_NAME"))
    @Enumerated(EnumType.STRING)
    @Column(name = "PERMISSION_CODE", nullable = false, length = 40)
    private Set<Permission> permissions = new HashSet<>();

    public RolePermissionPolicy(MemberRole role) {
        this.role = role;
    }

    public void replacePermissions(Set<Permission> replacement) {
        permissions.clear();
        permissions.addAll(replacement);
    }
}
