
import React, { useState, useEffect } from 'react';
import './App.css';

// Live Spring Boot backend deployed on Render
const API_BASE_URL =
  'https://personal-expense-tracker-ne3j.onrender.com/api/expenses';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Other'];

function App() {
  const [expenses, setExpenses] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => setSuccessMessage(''), 5000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!errorMessage) return;

    const timer = setTimeout(() => setErrorMessage(''), 7000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Get all expenses from the deployed backend
  const fetchExpenses = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(API_BASE_URL);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setErrorMessage(
        'Unable to connect to the backend. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setErrorMessage('Title must not be empty.');
      return false;
    }

    const amount = Number(formData.amount);

    if (!formData.amount || !Number.isFinite(amount) || amount <= 0) {
      setErrorMessage('Amount must be greater than zero.');
      return false;
    }

    if (!CATEGORIES.includes(formData.category)) {
      setErrorMessage('Please select a valid category.');
      return false;
    }

    if (!formData.date) {
      setErrorMessage('Please select a date.');
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  // Add a new expense or update an existing expense
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setErrorMessage('');
    setSuccessMessage('');

    const payload = {
      title: formData.title.trim(),
      amount: Number(formData.amount),
      category: formData.category,
      date: formData.date,
    };

    try {
      const isEditing = editingId !== null;
      const url = isEditing
        ? `${API_BASE_URL}/${editingId}`
        : API_BASE_URL;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Unable to save expense (HTTP ${response.status})`
        );
      }

      setSuccessMessage(
        isEditing
          ? `Expense "${payload.title}" updated successfully!`
          : `Expense "${payload.title}" added successfully!`
      );

      resetForm();
      await fetchExpenses();
    } catch (error) {
      console.error('Save error:', error);
      setErrorMessage(
        error.message || 'Unable to save the expense.'
      );
    }
  };

  // Load an expense into the form for editing
  const handleEdit = (expense) => {
    setEditingId(expense.id);

    setFormData({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category,
      date: expense.date,
    });

    setSuccessMessage('');
    setErrorMessage('');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Delete an expense after confirmation
  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            `Unable to delete expense (HTTP ${response.status})`
        );
      }

      setSuccessMessage(`Expense "${title}" deleted successfully!`);

      if (editingId === id) {
        resetForm();
      }

      await fetchExpenses();
    } catch (error) {
      console.error('Delete error:', error);
      setErrorMessage(error.message || 'Unable to delete expense.');
    }
  };

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0),
    0
  );

  const filteredExpenses =
    selectedCategory === 'All'
      ? expenses
      : expenses.filter(
          (expense) =>
            expense.category.toLowerCase() ===
            selectedCategory.toLowerCase()
        );

  const filteredTotal = filteredExpenses.reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0),
    0
  );

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

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
      <header className="app-header">
        <h1>Personal Expense Tracker</h1>
      </header>

      {loading && (
        <div className="alert alert-loading">
          Loading expenses from backend...
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <span>✓ {successMessage}</span>
          <button
            className="alert-close"
            onClick={() => setSuccessMessage('')}
            aria-label="Close success message"
          >
            ×
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          <span>⚠ {errorMessage}</span>
          <button
            className="alert-close"
            onClick={() => setErrorMessage('')}
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}

      <div className="summary-grid">
        <div className="summary-card highlight">
          <span className="summary-title">Total Expenses</span>
          <span className="summary-value">
            {formatCurrency(totalAmount)}
          </span>
          <span className="summary-subtext">
            Across all {expenses.length} saved records
          </span>
        </div>

        <div className="summary-card secondary">
          <span className="summary-title">Total Entries</span>
          <span className="summary-value">{expenses.length}</span>
          <span className="summary-subtext">
            Expenses returned by the backend
          </span>
        </div>

        {selectedCategory !== 'All' && (
          <div className="summary-card filter-card">
            <span className="summary-title">
              {selectedCategory} Total
            </span>
            <span className="summary-value">
              {formatCurrency(filteredTotal)}
            </span>
            <span className="summary-subtext">
              {filteredExpenses.length} matching records
            </span>
          </div>
        )}
      </div>

      <section className="section-card">
        <h2 className="section-title">
          {editingId !== null ? 'Edit Expense' : 'Add New Expense'}
        </h2>

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-grid">
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
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

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

          <div className="form-actions">
            <button
              type="submit"
              className={`btn ${
                editingId !== null ? 'btn-warning' : 'btn-primary'
              }`}
            >
              {editingId !== null ? 'Update Expense' : 'Add Expense'}
            </button>

            {editingId !== null && (
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

      <section className="section-card">
        <div className="filter-bar">
          <h2 className="section-title" style={{ margin: 0 }}>
            Expense Records ({filteredExpenses.length})
          </h2>

          <div className="filter-group">
            <label htmlFor="filter-category">
              Filter by Category:
            </label>
            <select
              id="filter-category"
              className="filter-select"
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

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
                    <td className="expense-amount">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td>
                      <span
                        className={`category-badge ${getCategoryBadgeClass(
                          expense.category
                        )}`}
                      >
                        {expense.category}
                      </span>
                    </td>
                    <td>{expense.date}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div
                        className="table-actions"
                        style={{ justifyContent: 'center' }}
                      >
                        <button
                          className="btn btn-sm btn-edit"
                          onClick={() => handleEdit(expense)}
                          title="Edit this expense"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-delete"
                          onClick={() =>
                            handleDelete(expense.id, expense.title)
                          }
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
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <p>
              {expenses.length === 0
                ? 'No expenses recorded yet.'
                : `No expenses found in category "${selectedCategory}".`}
            </p>
            <small>
              {expenses.length === 0
                ? 'Use the form above to record your first expense.'
                : 'Select All Categories or another category to view expenses.'}
            </small>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
