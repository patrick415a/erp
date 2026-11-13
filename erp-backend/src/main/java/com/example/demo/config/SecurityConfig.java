package com.example.demo.config;

import com.example.demo.repository.MemberRepository;
import com.example.demo.service.RolePermissionService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static com.example.demo.entity.Permission.*;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 💡 에러 원인 해결: PasswordEncoder를 스프링 빈으로 등록
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 개발 편의를 위한 기본 시큐리티 설정 (CORS, CSRF 비활성화 및 회원가입 URL 허용)
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtProvider jwtProvider,
            MemberRepository members, RolePermissionService permissions) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configure(http))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(errors -> errors.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .addFilterBefore(new ErpAuthorizationFilter(jwtProvider, members, permissions), AnonymousAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/members/**", "/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/access").authenticated()
                        .requestMatchers("/api/settings/permissions", "/api/settings/permissions/*").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/system/appearance", "/api/system/logo").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/settings/system").hasAuthority(SYSTEM_SETTINGS_VIEW.name())
                        .requestMatchers(HttpMethod.PUT, "/api/settings/system/brand", "/api/settings/system/theme").hasAuthority(SYSTEM_SETTINGS_UPDATE.name())
                        .requestMatchers(HttpMethod.GET, "/api/settings/company", "/api/settings/items").hasAuthority(SETTINGS_VIEW.name())
                        .requestMatchers(HttpMethod.PUT, "/api/settings/company", "/api/settings/items/*").hasAuthority(SETTINGS_UPDATE.name())
                        .requestMatchers(HttpMethod.POST, "/api/settings/items").hasAuthority(SETTINGS_CREATE.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/settings/items/*").hasAuthority(SETTINGS_DELETE.name())
                        .requestMatchers(HttpMethod.GET, "/api/admin/users").hasAuthority(USERS_VIEW.name())
                        .requestMatchers(HttpMethod.PUT, "/api/admin/users/*/role").hasAuthority(USERS_UPDATE.name())
                        .requestMatchers(HttpMethod.GET, "/api/production/orders").hasAuthority(PRODUCTION_VIEW.name())
                        .requestMatchers(HttpMethod.POST, "/api/production/orders").hasAuthority(PRODUCTION_CREATE.name())
                        .requestMatchers(HttpMethod.PUT, "/api/production/orders/*").hasAuthority(PRODUCTION_UPDATE.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/production/orders/*").hasAuthority(PRODUCTION_DELETE.name())
                        .requestMatchers(HttpMethod.GET, "/api/inventory/items").hasAuthority(INVENTORY_VIEW.name())
                        .requestMatchers(HttpMethod.POST, "/api/inventory/items").hasAuthority(INVENTORY_CREATE.name())
                        .requestMatchers(HttpMethod.PUT, "/api/inventory/items/*").hasAuthority(INVENTORY_UPDATE.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/inventory/items/*").hasAuthority(INVENTORY_DELETE.name())
                        .requestMatchers(HttpMethod.GET, "/api/hr/employees").hasAuthority(HR_VIEW.name())
                        .requestMatchers(HttpMethod.POST, "/api/hr/employees").hasAuthority(HR_CREATE.name())
                        .requestMatchers(HttpMethod.PUT, "/api/hr/employees/*").hasAuthority(HR_UPDATE.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/hr/employees/*").hasAuthority(HR_DELETE.name())
                        .anyRequest().denyAll()
                );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 💡 프론트엔드 주소 허용 (포트 번호 주의)
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://localhost:3001"));
        // 💡 허용할 HTTP 메서드
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 경로에 적용
        return source;
    }
}
