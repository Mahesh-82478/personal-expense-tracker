package com.expensetracker.controller;

import com.expensetracker.entity.Expense;
import com.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller exposing API endpoints for managing Expenses.
 * Base URL: /api/expenses
 */
@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*") // Allows React frontend running on port 5173 or any other port
public class ExpenseController {

    private final ExpenseService expenseService;

    @Autowired
    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    /**
     * GET /api/expenses - Retrieve all expenses.
     *
     * @return 200 OK with list of expenses
     */
    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        List<Expense> expenses = expenseService.getAllExpenses();
        return ResponseEntity.ok(expenses);
    }

    /**
     * GET /api/expenses/{id} - Retrieve an expense by its ID.
     *
     * @param id ID of the expense
     * @return 200 OK with the expense or 404 Not Found if missing
     */
    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Long id) {
        Expense expense = expenseService.getExpenseById(id);
        return ResponseEntity.ok(expense);
    }

    /**
     * POST /api/expenses - Create a new expense.
     *
     * @param expense expense payload validated by @Valid
     * @return 201 Created with the saved expense
     */
    @PostMapping
    public ResponseEntity<Expense> createExpense(@Valid @RequestBody Expense expense) {
        Expense createdExpense = expenseService.createExpense(expense);
        return new ResponseEntity<>(createdExpense, HttpStatus.CREATED);
    }

    /**
     * PUT /api/expenses/{id} - Update an existing expense.
     *
     * @param id ID of the expense to update
     * @param expense updated expense details validated by @Valid
     * @return 200 OK with updated expense or 404 Not Found if missing
     */
    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @Valid @RequestBody Expense expense) {
        Expense updatedExpense = expenseService.updateExpense(id, expense);
        return ResponseEntity.ok(updatedExpense);
    }

    /**
     * DELETE /api/expenses/{id} - Delete an expense.
     *
     * @param id ID of the expense to delete
     * @return 200 OK with confirmation message or 404 Not Found if missing
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Expense with ID " + id + " deleted successfully.");
        return ResponseEntity.ok(response);
    }
}
