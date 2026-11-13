package com.example.demo.controller;

import com.example.demo.entity.SystemSettings.Theme;
import com.example.demo.service.SystemSettingsService;
import com.example.demo.service.SystemSettingsService.SettingsSnapshot;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class SystemSettingsController {
    private final SystemSettingsService settings;

    @GetMapping("/api/system/appearance")
    public ResponseEntity<SettingsSnapshot> appearance() {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(settings.get());
    }

    @GetMapping("/api/system/logo")
    public ResponseEntity<byte[]> logo() {
        byte[] logo = settings.getLogo();
        if (logo == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().cacheControl(CacheControl.noCache())
                .contentType(MediaType.IMAGE_PNG).body(logo);
    }

    @PutMapping(value = "/api/settings/system/brand", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SettingsSnapshot updateBrand(@RequestParam String name,
            @RequestParam(defaultValue = "false") boolean resetLogo,
            @RequestParam(required = false) Long version,
            @RequestParam(required = false) MultipartFile logo) {
        return settings.saveBrand(name, logo, resetLogo, version);
    }

    @PutMapping("/api/settings/system/theme")
    public SettingsSnapshot updateTheme(@RequestBody ThemeChange change) {
        return settings.saveTheme(change.theme(), change.version());
    }

    public record ThemeChange(Theme theme, Long version) {}
}
