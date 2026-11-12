package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "COMPANY_INFO")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CompanyInfo {
    @Id
    private Long id;

    @Version
    private Long version;

    @Column(name = "COMPANY_NAME", nullable = false, length = 100)
    private String name;

    @Column(name = "REGISTRATION_NUMBER", nullable = false, length = 12)
    private String registration;

    @Column(name = "CONTACT_EMAIL", nullable = false, length = 254)
    private String email;

    public CompanyInfo(Long id) {
        this.id = id;
    }

    public void update(String name, String registration, String email) {
        this.name = name;
        this.registration = registration;
        this.email = email;
    }
}
