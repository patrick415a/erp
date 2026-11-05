package com.example.demo.service;

import com.example.demo.entity.InventoryItem;
import com.example.demo.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;

    // 전체 재고 조회
    @Transactional(readOnly = true)
    public List<InventoryItem> getAllItems() {
        return inventoryRepository.findAll();
    }

    // 신규 품목 등록
    @Transactional
    public InventoryItem createItem(InventoryItem item) {

        int year = Year.now().getValue();
        String prefix = "INV-" + year + "-";

        // 해당 연도에 생성된 품목 번호 중 가장 큰 번호 조회
        String lastId = inventoryRepository
                .findTopByIdStartingWithOrderByIdDesc(prefix)
                .map(InventoryItem::getId)
                .orElse(null);

        int nextNumber = 1;

        if (lastId != null) {
            String numberPart = lastId.substring(prefix.length());
            nextNumber = Integer.parseInt(numberPart) + 1;
        }

        String newId = prefix + String.format("%04d", nextNumber);

        item.setId(newId);

        return inventoryRepository.save(item);
    }

    // 기존 품목 수정
    @Transactional
    public InventoryItem updateItem(String id, InventoryItem updatedItem) {

        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("존재하지 않는 품목입니다."));

        item.setName(updatedItem.getName());
        item.setCategory(updatedItem.getCategory());
        item.setStock(updatedItem.getStock());
        item.setUnitPrice(updatedItem.getUnitPrice());
        item.setStatus(updatedItem.getStatus());

        return inventoryRepository.save(item);
    }

    // 품목 삭제
    @Transactional
    public void deleteItem(String id) {

        if (!inventoryRepository.existsById(id)) {
            throw new IllegalArgumentException("존재하지 않는 품목입니다.");
        }

        inventoryRepository.deleteById(id);
    }
}
