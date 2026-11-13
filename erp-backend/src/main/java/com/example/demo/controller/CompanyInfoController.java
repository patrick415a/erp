package com.example.demo.controller;

import com.example.demo.dto.CompanyInfoDto;
import com.example.demo.service.CompanyInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings/company")
@RequiredArgsConstructor
public class CompanyInfoController {
    private final CompanyInfoService service;

    @GetMapping
    public CompanyInfoDto get() {
        return service.get();
    }

    @PutMapping
    public CompanyInfoDto save(
        @RequestBody CompanyInfoDto company
    ) {
        return service.save(company);
    }

}
