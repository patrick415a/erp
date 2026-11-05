package com.example.demo.controller;

import com.example.demo.entity.ProductionOrder;
import com.example.demo.service.ProductionOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ProductionOrderController {

    private final ProductionOrderService productionOrderService;

    @GetMapping
    public ResponseEntity<List<ProductionOrder>> getAllOrders(){
        List<ProductionOrder> orders = productionOrderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PostMapping
    public ResponseEntity<ProductionOrder> createOrder (@RequestBody ProductionOrder order) {
        ProductionOrder savedOrder = productionOrderService.createOrder(order);
        return ResponseEntity.ok(savedOrder);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductionOrder> updateOrder(@PathVariable String id, @RequestBody ProductionOrder updatedOrder) {
        ProductionOrder savedOrder = productionOrderService.updateOrder(id, updatedOrder);
        return ResponseEntity.ok(savedOrder);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        productionOrderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
