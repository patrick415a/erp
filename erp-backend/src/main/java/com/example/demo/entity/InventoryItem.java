package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "INVENTORY_ITEMS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {
    @Id
    @Column(name = "ITEM_ID", length = 50)
    private String id;

    @Column(name = "ITEM_NAME", nullable = false, length = 100)
    private String name;

    @Column(name = "CATEGORY", length = 50)
    private String category;

    @Column(name = "STOCK", nullable = false)
    private Integer stock;

    @Column(name = "UNIT_PRICE", nullable = false)
    private Integer unitPrice;

    @Column(name = "STATUS", length = 20)
    private String status;
}
