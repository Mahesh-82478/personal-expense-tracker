package com.expensetracker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Expense Entity representing a single expense record in the H2 database.
 */
@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title must not be empty")
    @Column(nullable = false)
    private String title;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", inclusive = true, message = "Amount must be greater than zero")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @NotBlank(message = "Category must be selected")
    @Column(nullable = false)
    private String category;

    @NotNull(message = "Date must be entered")
    @Column(nullable = false)
    private LocalDate date;

    // Default No-Arg Constructor required by JPA
    public Expense() {
    }

    // Parameterized Constructor
    public Expense(Long id, String title, BigDecimal amount, String category, LocalDate date) {
        this.id = id;
        this.title = title;
        this.amount = amount;
        this.category = category;
        this.date = date;
    }

    public Expense(String title, BigDecimal amount, String category, LocalDate date) {
        this.title = title;
        this.amount = amount;
        this.category = category;
        this.date = date;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    @Override
    public String toString() {
        return "Expense{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", amount=" + amount +
                ", category='" + category + '\'' +
                ", date=" + date +
                '}';
    }
}
