package com.example.demo.service;

import com.example.demo.dto.CompanyInfoDto;
import com.example.demo.entity.CompanyInfo;
import com.example.demo.repository.CompanyInfoRepository;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CompanyInfoService {
    private static final long COMPANY_INFO_ID = 1L;
    private static final Pattern REGISTRATION_PATTERN = Pattern.compile("[0-9]{10}|[0-9]{3}-[0-9]{2}-[0-9]{5}");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[^\\s@]+@[^\\s@]+\\.[^\\s@]+");
    private final CompanyInfoRepository repository;

    @Transactional(readOnly = true)
    public CompanyInfoDto get() {
        return repository.findById(COMPANY_INFO_ID)
            .map(CompanyInfoService::toDto)
            .orElseGet(() -> new CompanyInfoDto("", "", ""));
    }

    @Transactional
    public CompanyInfoDto save(CompanyInfoDto input) {
        String name = trim(input.name());
        String registration = trim(input.registration());
        String email = trim(input.email());

        if (name.isBlank() || name.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "회사명을 100자 이내로 입력해 주세요.");
        }
        if (!REGISTRATION_PATTERN.matcher(registration).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "사업자등록번호를 숫자 10자리로 입력해 주세요.");
        }
        if (email.length() > 254 || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "대표 이메일 주소를 확인해 주세요.");
        }

        String digits = registration.replace("-", "");
        String formattedRegistration = digits.substring(0, 3) + "-" + digits.substring(3, 5) + "-" + digits.substring(5);
        CompanyInfo company = repository.findById(COMPANY_INFO_ID).orElseGet(() -> new CompanyInfo(COMPANY_INFO_ID));
        company.update(name, formattedRegistration, email);

        try {
            return toDto(repository.saveAndFlush(company));
        } catch (OptimisticLockingFailureException | DataIntegrityViolationException error) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "저장 중 회사 정보가 변경되었습니다. 새로고침한 뒤 다시 시도해 주세요.", error);
        }
    }

    private static CompanyInfoDto toDto(CompanyInfo company) {
        return new CompanyInfoDto(company.getName(), company.getRegistration(), company.getEmail());
    }

    private static String trim(String value) {
        return value == null ? "" : value.strip();
    }
}
