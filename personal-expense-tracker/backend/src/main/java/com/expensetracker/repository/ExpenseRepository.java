package com.expensetracker.repository;

import com.expensetracker.entity.Expense;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA Repository for Expense entity.
 * Provides standard CRUD operations: save, findById, findAll, deleteById, etc.
 */
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    /**
     * Find expenses by category.
     *
     * @param category category name (e.g., Food, Travel, Shopping, Other)
     * @return list of matching expenses
     */
    List<Expense> findByCategoryIgnoreCase(String category);
}
