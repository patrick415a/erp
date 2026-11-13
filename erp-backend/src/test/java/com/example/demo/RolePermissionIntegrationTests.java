package com.example.demo;

import com.example.demo.config.JwtProvider;
import com.example.demo.entity.Member;
import com.example.demo.entity.MemberRole;
import com.example.demo.repository.MemberRepository;
import com.example.demo.repository.RolePermissionPolicyRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:role_permissions;MODE=Oracle;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=update",
        "jwt.secret=dGVzdC1vbmx5LWtleS1mb3Itcm9sZS1wZXJtaXNzaW9ucy10ZXN0cw==",
        "jwt.expiration-time=60000"
})
class RolePermissionIntegrationTests {
    @LocalServerPort
    private int port;

    @Autowired
    private MemberRepository members;

    @Autowired
    private RolePermissionPolicyRepository policies;

    @Autowired
    private JwtProvider jwtProvider;

    private final HttpClient client = HttpClient.newHttpClient();

    @Test
    void savedRoleControlsMenusAndProtectedApiOperations() throws Exception {
        String administrator = tokenFor("admin@example.test", MemberRole.SYSTEM_ADMIN);
        String employee = tokenFor("employee@example.test", MemberRole.EMPLOYEE);
        String path = "/api/settings/permissions/EMPLOYEE";

        assertThat(send("GET", "/api/access", null, null).statusCode()).isEqualTo(401);
        assertThat(send("GET", "/api/settings/permissions", employee, null).statusCode()).isEqualTo(403);
        assertThat(send("GET", "/api/settings/permissions", administrator, null).body()).contains("SYSTEM_ADMIN", "EMPLOYEE");
        assertThat(send("GET", "/api/access", employee, null).body()).contains("PRODUCTION_VIEW").doesNotContain("INVENTORY_VIEW");
        assertThat(send("GET", "/api/production/orders", employee, null).statusCode()).isEqualTo(200);

        assertThat(send("PUT", path, administrator,
                """
                {"permissions":["INVENTORY_CREATE"],"version":null}
                """).statusCode()).isEqualTo(400);
        assertThat(send("PUT", "/api/settings/permissions/SYSTEM_ADMIN", administrator,
                """
                {"permissions":[],"version":null}
                """).statusCode()).isEqualTo(400);

        assertThat(send("PUT", path, administrator,
                """
                {"permissions":["SETTINGS_VIEW","SETTINGS_CREATE"],"version":null}
                """).statusCode()).isEqualTo(200);
        assertThat(policies.findById(MemberRole.EMPLOYEE)).isPresent();
        assertThat(send("GET", "/api/access", employee, null).body()).contains("SETTINGS_VIEW").doesNotContain("PRODUCTION_VIEW");
        assertThat(send("GET", "/api/settings/company", employee, null).statusCode()).isEqualTo(200);
        assertThat(send("GET", "/api/settings/items", employee, null).statusCode()).isEqualTo(200);
        assertThat(send("GET", "/api/inventory/items", employee, null).statusCode()).isEqualTo(403);
        assertThat(send("PUT", "/api/settings/company", employee, "{}").statusCode()).isEqualTo(403);
        assertThat(send("PUT", path, administrator,
                """
                {"permissions":[],"version":null}
                """).statusCode()).isEqualTo(409);

        Long version = policies.findById(MemberRole.EMPLOYEE).orElseThrow().getVersion();
        assertThat(send("PUT", path, administrator,
                """
                {"permissions":[],"version":%d}
                """.formatted(version)).statusCode()).isEqualTo(200);
        assertThat(send("GET", "/api/access", employee, null).body()).contains("\"permissions\":[]");
        assertThat(send("GET", "/api/settings/items", employee, null).statusCode()).isEqualTo(403);

        Long employeeId = members.findByEmail("employee@example.test").orElseThrow().getId();
        String changeRolePath = "/api/admin/users/" + employeeId + "/role";
        assertThat(send("PUT", changeRolePath, administrator,
                """
                {"role":"PRODUCTION_MANAGER"}
                """).statusCode()).isEqualTo(204);
        assertThat(send("GET", "/api/access", employee, null).body()).contains("PRODUCTION_MANAGER", "PRODUCTION_CREATE");
        assertThat(send("GET", "/api/production/orders", employee, null).statusCode()).isEqualTo(200);
        assertThat(send("GET", "/api/admin/users", employee, null).statusCode()).isEqualTo(403);
    }

    private String tokenFor(String email, MemberRole role) {
        members.save(Member.builder().email(email).firstName("ERP").lastName("Test")
                .password("unused").role(role).build());
        return jwtProvider.generateToken(email);
    }

    private HttpResponse<String> send(String method, String path, String token, String body)
            throws IOException, InterruptedException {
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
        if (token != null) request.header("Authorization", "Bearer " + token);
        if (body != null) request.header("Content-Type", "application/json");
        return client.send(request.method(method, body == null
                        ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body)).build(),
                HttpResponse.BodyHandlers.ofString());
    }
}
