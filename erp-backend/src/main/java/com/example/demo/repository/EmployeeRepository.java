package com.example.demo.repository;

import com.example.demo.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, String> {
    //가장 마지막에 등록된 직원 사번 조회
    Optional<Employee> findTopByIdStartingWithOrderByIdDesc(String prefix);
}
