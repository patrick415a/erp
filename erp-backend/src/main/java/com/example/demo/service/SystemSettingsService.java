package com.example.demo.service;

import com.example.demo.entity.SystemSettings;
import com.example.demo.entity.SystemSettings.Theme;
import com.example.demo.repository.SystemSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class SystemSettingsService {
    private static final long MAX_UPLOAD_BYTES = 1024 * 1024;
    private static final int MAX_SOURCE_DIMENSION = 2048;
    private static final int LOGO_DIMENSION = 192;
    private final SystemSettingsRepository repository;

    @Transactional(readOnly = true)
    public SettingsSnapshot get() {
        return snapshot(readSettings());
    }

    @Transactional(readOnly = true)
    public byte[] getLogo() {
        return readSettings().getLogo();
    }

    @Transactional
    public SettingsSnapshot saveBrand(String name, MultipartFile image, boolean resetLogo, Long version) {
        String cleanedName = name.strip();
        if (cleanedName.isBlank() || cleanedName.length() > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "시스템명을 1~50자로 입력해 주세요.");
        }
        SystemSettings settings = readSettings();
        checkVersion(settings, version);
        byte[] logo = settings.getLogo();
        if (image != null) logo = readLogo(image);
        else if (resetLogo) logo = null;
        settings.updateBrand(cleanedName, logo);
        return save(settings);
    }

    @Transactional
    public SettingsSnapshot saveTheme(Theme theme, Long version) {
        if (theme == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "기본 테마를 선택해 주세요.");
        }
        SystemSettings settings = readSettings();
        checkVersion(settings, version);
        settings.updateTheme(theme);
        return save(settings);
    }

    private SystemSettings readSettings() {
        return repository.findById(SystemSettings.ID).orElseGet(SystemSettings::defaults);
    }

    private SettingsSnapshot save(SystemSettings settings) {
        try {
            return snapshot(repository.saveAndFlush(settings));
        } catch (OptimisticLockingFailureException | DataIntegrityViolationException error) {
            throw conflict();
        }
    }

    private static void checkVersion(SystemSettings settings, Long version) {
        if (!Objects.equals(settings.getVersion(), version)) throw conflict();
    }

    private static ResponseStatusException conflict() {
        return new ResponseStatusException(HttpStatus.CONFLICT, "다른 곳에서 설정을 변경했습니다. 최신 설정을 불러온 뒤 다시 저장해 주세요.");
    }

    private static SettingsSnapshot snapshot(SystemSettings settings) {
        return new SettingsSnapshot(settings.getName(), settings.getDefaultTheme(), settings.getLogo() != null, settings.getVersion());
    }

    private static byte[] readLogo(MultipartFile file) {
        if (file.isEmpty() || file.getSize() > MAX_UPLOAD_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "1MB 이하의 로고 이미지를 선택해 주세요.");
        }
        try (var input = file.getInputStream(); var imageInput = ImageIO.createImageInputStream(input)) {
            var readers = ImageIO.getImageReaders(imageInput);
            if (!readers.hasNext()) throw invalidLogo();
            var reader = readers.next();
            try {
                String format = reader.getFormatName();
                if (!format.equalsIgnoreCase("PNG") && !format.equalsIgnoreCase("JPEG")) throw invalidLogo();
                reader.setInput(imageInput, true, true);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if (Math.max(width, height) > MAX_SOURCE_DIMENSION) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "로고의 가로와 세로는 각각 2048px 이하여야 합니다.");
                }
                return resizeLogo(reader.read(0), width, height);
            } finally {
                reader.dispose();
            }
        } catch (IOException | IllegalArgumentException error) {
            throw invalidLogo();
        }
    }

    private static byte[] resizeLogo(BufferedImage image, int width, int height) throws IOException {
        double scale = Math.min(1.0, (double) LOGO_DIMENSION / Math.max(width, height));
        int targetWidth = Math.max(1, (int) Math.round(width * scale));
        int targetHeight = Math.max(1, (int) Math.round(height * scale));
        BufferedImage logo = new BufferedImage(LOGO_DIMENSION, LOGO_DIMENSION, BufferedImage.TYPE_INT_ARGB);
        Graphics2D graphics = logo.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            graphics.drawImage(image, (LOGO_DIMENSION - targetWidth) / 2, (LOGO_DIMENSION - targetHeight) / 2,
                    targetWidth, targetHeight, null);
        } finally {
            graphics.dispose();
        }
        var output = new ByteArrayOutputStream();
        ImageIO.write(logo, "png", output);
        return output.toByteArray();
    }

    private static ResponseStatusException invalidLogo() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 PNG 또는 JPG 이미지를 선택해 주세요.");
    }

    public record SettingsSnapshot(String name, Theme defaultTheme, boolean hasLogo, Long version) {}
}
