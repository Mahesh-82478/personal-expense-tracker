package com.expensetracker.service;

import com.expensetracker.entity.Expense;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.ExpenseRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service layer containing business logic for Expense management.
 */
@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    @Autowired
    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    /**
     * Retrieve all expenses from the database.
     *
     * @return list of all expenses
     */
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    /**
     * Retrieve a single expense by its ID.
     *
     * @param id ID of the expense
     * @return the expense if found
     * @throws ResourceNotFoundException if no expense exists with the given ID
     */
    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
    }

    /**
     * Create and persist a new expense.
     *
     * @param expense new expense data
     * @return saved expense with generated ID
     */
    public Expense createExpense(Expense expense) {
        // Ensure ID is null so database generates it
        expense.setId(null);
        return expenseRepository.save(expense);
    }

    /**
     * Update an existing expense.
     *
     * @param id ID of expense to update
     * @param updatedExpense new data for the expense
     * @return updated expense
     * @throws ResourceNotFoundException if no expense exists with the given ID
     */
    public Expense updateExpense(Long id, Expense updatedExpense) {
        Expense existingExpense = getExpenseById(id);

        existingExpense.setTitle(updatedExpense.getTitle());
        existingExpense.setAmount(updatedExpense.getAmount());
        existingExpense.setCategory(updatedExpense.getCategory());
        existingExpense.setDate(updatedExpense.getDate());

        return expenseRepository.save(existingExpense);
    }

    /**
     * Delete an expense by its ID.
     *
     * @param id ID of expense to delete
     * @throws ResourceNotFoundException if no expense exists with the given ID
     */
    public void deleteExpense(Long id) {
        Expense existingExpense = getExpenseById(id);
        expenseRepository.delete(existingExpense);
    }

    /**
     * Filter expenses by category.
     *
     * @param category category to filter
     * @return list of matching expenses
     */
    public List<Expense> getExpensesByCategory(String category) {
        return expenseRepository.findByCategoryIgnoreCase(category);
    }
}
