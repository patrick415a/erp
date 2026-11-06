package com.example.demo.service;

import com.example.demo.entity.Employee;
import com.example.demo.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    private final EmployeeRepository employeeRepository;

    // 전체 직원 조회
    @Transactional(readOnly = true)
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // 신규 직원 등록
    @Transactional
    public Employee createEmployee(Employee employee) {
        // 마지막 직원 사번 조회
        String lastId = employeeRepository
                .findTopByIdStartingWithOrderByIdDesc("EMP-")
                .map(Employee::getId)
                .orElse(null);

        int nextNumber = 1;

        if (lastId != null) {
            String numberPart = lastId.substring(4);
            nextNumber = Integer.parseInt(numberPart) + 1;
        }

        // EMP-001, EMP-002 형식으로 생성
        String newId = "EMP-" + String.format("%03d", nextNumber);
        employee.setId(newId);

        return employeeRepository.save(employee);
    }

    // 기존 직원 정보 수정
    @Transactional
    public Employee updateEmployee(String id, Employee updatedEmployee) {
        Employee employee = employeeRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 직원입니다."));

        employee.setName(updatedEmployee.getName());
        employee.setDepartment(updatedEmployee.getDepartment());
        employee.setRole(updatedEmployee.getRole());
        employee.setStatus(updatedEmployee.getStatus());
        employee.setJoinDate(updatedEmployee.getJoinDate());

        return employeeRepository.save(employee);
    }

    // 직원 삭제
    @Transactional
    public void deleteEmployee(String id) {
        if (!employeeRepository.existsById(id)) {
            throw new IllegalArgumentException("존재하지 않는 직원입니다.");
        }

        employeeRepository.deleteById(id);
    }
}
