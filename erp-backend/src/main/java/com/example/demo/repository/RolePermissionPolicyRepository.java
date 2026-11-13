package com.example.demo.repository;

import com.example.demo.entity.MemberRole;
import com.example.demo.entity.RolePermissionPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionPolicyRepository extends JpaRepository<RolePermissionPolicy, MemberRole> {
}
