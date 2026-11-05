package com.example.demo.service;

import com.example.demo.entity.ProductionOrder;
import com.example.demo.repository.ProductionOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionOrderService {

    private final ProductionOrderRepository productionOrderRepository;

    @Transactional(readOnly = true)
    public List<ProductionOrder> getAllOrders(){
        return productionOrderRepository.findAll();
    }

    @Transactional
    public ProductionOrder createOrder(ProductionOrder order) {
        Long sequence = productionOrderRepository.getNextOrderSequence();
        int year = java.time.Year.now().getValue();

        String orderId = String.format("PRD-%d-%04d", year, sequence);
        order.setId(orderId);

        return productionOrderRepository.save(order);
    }

    @Transactional
    public ProductionOrder updateOrder(String id, ProductionOrder updatedOrder) {
        ProductionOrder order = productionOrderRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("생산 오더가 없습니다: " + id));

        order.setProductName(updatedOrder.getProductName());
        order.setQuantity(updatedOrder.getQuantity());
        order.setStatus(updatedOrder.getStatus());
        order.setProgress(updatedOrder.getProgress());
        order.setDueDate(updatedOrder.getDueDate());

        return productionOrderRepository.save(order);
    }

    @Transactional
    public void deleteOrder(String id) {
        if (!productionOrderRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "존재하지 않는 생산 오더입니다: " + id
            );
        }

        productionOrderRepository.deleteById(id);
    }
}