import React, { useState, useEffect } from 'react';
import './App.css';

// Base REST API URL pointing to the Spring Boot backend
const API_BASE_URL = 'http://localhost:8080/api/expenses';

// Allowed Categories defined by application requirements
const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Other'];

function App() {
  // State for all expenses fetched from the backend
  const [expenses, setExpenses] = useState([]);

  // Form input state
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date (YYYY-MM-DD)
  });

  // State to track if we are in "Edit" mode (holds ID of item being edited, or null)
  const [editingId, setEditingId] = useState(null);

  // Category filter state ('All' or specific category)
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Loading and Notification feedback states
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 7000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Load all expenses on initial component mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  /**
   * Fetch all expenses from Spring Boot backend using Fetch API
   */
  const fetchExpenses = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setErrorMessage(
        'Unable to connect to the backend server at ' +
          API_BASE_URL +
          '. Please ensure your Spring Boot application is running on port 8080.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle text, number, and select input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Validate form inputs on client side before sending request to backend
   */
  const validateForm = () => {
    if (!formData.title || formData.title.trim() === '') {
      setErrorMessage('Validation error: Title must not be empty.');
      return false;
    }
    const parsedAmount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Validation error: Amount must be a valid number greater than zero.');
      return false;
    }
    if (!formData.category || formData.category.trim() === '') {
      setErrorMessage('Validation error: Please select an expense category.');
      return false;
    }
    if (!formData.date) {
      setErrorMessage('Validation error: Please enter a valid date.');
      return false;
    }
    return true;
  };

  /**
   * Handle form submission for both Add and Update operations
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    const payload = {
      title: formData.title.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
    };

    try {
      if (editingId) {
        // PUT /api/expenses/{id} - Update existing expense
        const response = await fetch(`${API_BASE_URL}/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMsg = errorData?.message || `Failed to update expense (HTTP ${response.status})`;
          throw new Error(errorMsg);
        }

        setSuccessMessage(`Expense "${payload.title}" updated successfully!`);
        setEditingId(null);
      } else {
        // POST /api/expenses - Add new expense
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMsg = errorData?.message || `Failed to add expense (HTTP ${response.status})`;
          throw new Error(errorMsg);
        }

        setSuccessMessage(`Expense "${payload.title}" added successfully!`);
      }

      // Reset form fields
      setFormData({
        title: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
      });

      // Refresh data from the backend to ensure data consistency
      await fetchExpenses();
    } catch (error) {
      console.error('Submit error:', error);
      setErrorMessage(error.message || 'Operation failed. Please check the backend connection.');
    }
  };

  /**
   * Populate form with existing expense values for editing
   */
  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
    });
    setSuccessMessage('');
    setErrorMessage('');
    // Scroll smoothly to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Cancel edit mode and reset form fields
   */
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    });
    setErrorMessage('');
  };

  /**
   * Delete an expense after asking user for explicit confirmation
   */
  const handleDelete = async (id, title) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the expense "${title}" (ID: ${id})?`
    );

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.message || `Failed to delete expense (HTTP ${response.status})`;
        throw new Error(errorMsg);
      }

      setSuccessMessage(`Expense "${title}" deleted successfully!`);

      // If user was editing this item, cancel editing mode
      if (editingId === id) {
        handleCancelEdit();
      }

      // Refresh list from backend
      await fetchExpenses();
    } catch (error) {
      console.error('Delete error:', error);
      setErrorMessage(error.message || 'Failed to delete expense.');
    }
  };

  // Calculate total across ALL saved expenses (as specified by Requirement #5)
  const totalAmount = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  // Filter expenses according to the selected category filter
  const filteredExpenses =
    selectedCategory === 'All'
      ? expenses
      : expenses.filter(
          (expense) => expense.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  // Calculate filtered total for extra clarity
  const filteredTotal = filteredExpenses.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  /**
   * Helper to format currency nicely
   */
  const formatCurrency = (val) => {
    return `₹${parseFloat(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /**
   * Helper to return CSS class for category badge
   */
  const getCategoryBadgeClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'food':
        return 'badge-food';
      case 'travel':
        return 'badge-travel';
      case 'shopping':
        return 'badge-shopping';
      default:
        return 'badge-other';
    }
  };

  return (
    <div className="app-container">
      {/* 1. Header */}
      <header className="app-header">
        <h1>Personal Expense Tracker</h1>
      </header>

      {/* Notification Banners */}
      {loading && (
        <div className="alert alert-loading">
          <span>Loading expenses from backend...</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <span>&check; {successMessage}</span>
          <button className="alert-close" onClick={() => setSuccessMessage('')}>
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          <span>&#9888; {errorMessage}</span>
          <button className="alert-close" onClick={() => setErrorMessage('')}>
            &times;
          </button>
        </div>
      )}

      {/* 2. Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card highlight">
          <span className="summary-title">Total Expenses</span>
          <span className="summary-value">{formatCurrency(totalAmount)}</span>
          <span className="summary-subtext">Across all {expenses.length} saved records</span>
        </div>

        <div className="summary-card secondary">
          <span className="summary-title">Total Entries</span>
          <span className="summary-value">{expenses.length}</span>
          <span className="summary-subtext">Persistent in H2 Database</span>
        </div>

        {selectedCategory !== 'All' && (
          <div className="summary-card filter-card">
            <span className="summary-title">{selectedCategory} Total</span>
            <span className="summary-value">{formatCurrency(filteredTotal)}</span>
            <span className="summary-subtext">{filteredExpenses.length} records matching filter</span>
          </div>
        )}
      </div>

      {/* 3. Add / Edit Expense Form */}
      <section className="section-card">
        <h2 className="section-title">
          <span>{editingId ? 'Edit Expense' : 'Add New Expense'}</span>
          {editingId && (
            <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: '500' }}>
              Editing Record ID #{editingId}
            </span>
          )}
        </h2>

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-grid">
            {/* Title Input */}
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g., Grocery Shopping"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Amount Input */}
            <div className="form-group">
              <label htmlFor="amount">Amount (₹) *</label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Category Dropdown */}
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Select Category --</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className={`btn ${editingId ? 'btn-warning' : 'btn-primary'}`}
            >
              {editingId ? 'Update Expense' : 'Add Expense'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelEdit}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      {/* 4. Filter & Expenses Table */}
      <section className="section-card">
        <div className="filter-bar">
          <h2 className="section-title" style={{ margin: 0 }}>
            Expense Records ({filteredExpenses.length})
          </h2>

          <div className="filter-group">
            <label htmlFor="filter-category">Filter by Category:</label>
            <select
              id="filter-category"
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 5. Clean Expenses Table */}
        {filteredExpenses.length > 0 ? (
          <div className="table-responsive">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>
                      <strong>#{expense.id}</strong>
                    </td>
                    <td>{expense.title}</td>
                    <td className="expense-amount">{formatCurrency(expense.amount)}</td>
                    <td>
                      <span className={`category-badge ${getCategoryBadgeClass(expense.category)}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td>{expense.date}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="table-actions" style={{ justifyContent: 'center' }}>
                        <button
                          className="btn btn-sm btn-edit"
                          onClick={() => handleEdit(expense)}
                          title="Edit this expense"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-delete"
                          onClick={() => handleDelete(expense.id, expense.title)}
                          title="Delete this expense"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="empty-state">
            <div className="empty-state-icon">&#128176;</div>
            <p>
              {expenses.length === 0
                ? 'No expenses recorded yet.'
                : `No expenses found in category "${selectedCategory}".`}
            </p>
            <small>
              {expenses.length === 0
                ? 'Use the form above to record your first expense.'
                : 'Select "All Categories" or another category to view expenses.'}
            </small>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
