package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ERP_SYSTEM_SETTINGS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SystemSettings {
    public enum Theme { LIGHT, DARK }

    public static final long ID = 1L;
    public static final String DEFAULT_NAME = "ERP 시스템";

    @Id
    private Long id = ID;

    @Version
    private Long version;

    @Column(name = "SYSTEM_NAME", nullable = false, length = 50)
    private String name = DEFAULT_NAME;

    @Enumerated(EnumType.STRING)
    @Column(name = "DEFAULT_THEME", nullable = false, length = 10)
    private Theme defaultTheme = Theme.LIGHT;

    @Lob
    @Column(name = "LOGO_PNG")
    private byte[] logo;

    public static SystemSettings defaults() {
        return new SystemSettings();
    }

    public void updateBrand(String name, byte[] logo) {
        this.name = name;
        this.logo = logo;
    }

    public void updateTheme(Theme theme) {
        this.defaultTheme = theme;
    }
}
