package com.example.demo.entity;

public enum Permission {
    DASHBOARD_VIEW,
    PRODUCTION_VIEW,
    PRODUCTION_CREATE(PRODUCTION_VIEW),
    PRODUCTION_UPDATE(PRODUCTION_VIEW),
    PRODUCTION_DELETE(PRODUCTION_VIEW),
    INVENTORY_VIEW,
    INVENTORY_CREATE(INVENTORY_VIEW),
    INVENTORY_UPDATE(INVENTORY_VIEW),
    INVENTORY_DELETE(INVENTORY_VIEW),
    HR_VIEW,
    HR_CREATE(HR_VIEW),
    HR_UPDATE(HR_VIEW),
    HR_DELETE(HR_VIEW),
    SETTINGS_VIEW,
    SETTINGS_CREATE(SETTINGS_VIEW),
    SETTINGS_UPDATE(SETTINGS_VIEW),
    SETTINGS_DELETE(SETTINGS_VIEW),
    CALENDAR_VIEW,
    CALENDAR_CREATE(CALENDAR_VIEW),
    CALENDAR_UPDATE(CALENDAR_VIEW),
    CALENDAR_DELETE(CALENDAR_VIEW),
    USERS_VIEW,
    USERS_UPDATE(USERS_VIEW),
    SYSTEM_SETTINGS_VIEW;

    private final Permission prerequisite;

    Permission() {
        this(null);
    }

    Permission(Permission prerequisite) {
        this.prerequisite = prerequisite;
    }

    public Permission prerequisite() {
        return prerequisite;
    }
}
