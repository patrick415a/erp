package com.example.demo.config;

import com.example.demo.repository.MemberRepository;
import com.example.demo.entity.MemberRole;
import com.example.demo.service.RolePermissionService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@RequiredArgsConstructor
public class ErpAuthorizationFilter extends OncePerRequestFilter {
    private final JwtProvider jwtProvider;
    private final MemberRepository members;
    private final RolePermissionService permissions;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return !path.startsWith("/api/") || path.startsWith("/api/members/")
                || ("GET".equals(request.getMethod()) && ("/api/system/appearance".equals(path) || "/api/system/logo".equals(path)))
                || "OPTIONS".equals(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.regionMatches(true, 0, "Bearer ", 0, 7)) {
            String email = readEmail(header.substring(7).trim());
            if (email != null && !email.isBlank()) {
                members.findByEmail(email).ifPresent(member -> {
                    var authorities = new ArrayList<>(permissions.permissionsFor(member.getRole()).stream()
                            .map(permission -> new SimpleGrantedAuthority(permission.name())).toList());
                    if (member.getRole() == MemberRole.SYSTEM_ADMIN) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_SYSTEM_ADMIN"));
                    }
                    var context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(member, null, authorities));
                    SecurityContextHolder.setContext(context);
                });
            }
        }
        chain.doFilter(request, response);
    }

    private String readEmail(String token) {
        try {
            return jwtProvider.getEmailFromToken(token);
        } catch (JwtException | IllegalArgumentException error) {
            return null;
        }
    }
}
