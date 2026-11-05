package com.example.demo.repository;

import com.example.demo.entity.ProductionOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductionOrderRepository extends JpaRepository<ProductionOrder, String> {
    @Query(value = "SELECT PRODUCTION_ORDER_SEQ.NEXTVAL FROM DUAL", nativeQuery = true)
    Long getNextOrderSequence();
}
