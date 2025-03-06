import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";

const Tracker = ({ setIsAuthenticated }) => {
    const [expenses, setExpenses] = useState([]);
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [editIndex, setEditIndex] = useState(-1);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const navigate = useNavigate();

    const categories = ["Food & Beverage", "Rent", "Transport", "Relaxing"];

    const handleAddExpense = () => {
        if (!category) {
            alert("Please select a category");
            return;
        }
        const amountNum = Number(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        if (!date) {
            alert("Please select a date");
            return;
        }

        setExpenses([...expenses, { category, amount: amountNum, date }]);
        setCategory("");
        setAmount("");
        setDate("");
    };

    const handleDeleteExpense = (index) => {
        setExpenses(expenses.filter((_, i) => i !== index));
    };

    const handleEditExpense = (index) => {
        setEditIndex(index);
        const expense = expenses[index];
        setCategory(expense.category);
        setAmount(expense.amount);
        setDate(expense.date);
        setEditModalOpen(true);
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        const amountNum = Number(amount);
        if (!category || isNaN(amountNum) || amountNum <= 0 || !date) {
            alert("Please enter valid values");
            return;
        }

        const updatedExpenses = expenses.map((exp, i) =>
            i === editIndex ? { category, amount: amountNum, date } : exp
        );
        setExpenses(updatedExpenses);
        setEditModalOpen(false);
        setCategory("");
        setAmount("");
        setDate("");
        setEditIndex(-1);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setExpenses([]);
        navigate("/login");
    };

    const filteredExpenses = expenses.filter((expense) => {
        const categoryMatch = !filterCategory || expense.category === filterCategory;
        const dateMatch = !filterDate || expense.date === filterDate;
        return categoryMatch && dateMatch;
    });

    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="page active">
            <div className="tracker-container">
                <div className="user-panel">
                    <button onClick={handleLogout}>Logout</button>
                </div>
                <h1>Expense Tracker</h1>
                <div className="input-section">
                    <label htmlFor="category-select">Category:</label>
                    <select
                        id="category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                    <label htmlFor="amount-input">Amount:</label>
                    <input
                        type="number"
                        id="amount-input"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <label htmlFor="date-input">Date:</label>
                    <input
                        type="date"
                        id="date-input"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <button onClick={handleAddExpense}>Add</button>
                </div>
                <div className="expenses-list">
                    <h2>Expenses List</h2>
                    <div className="filter-section">
                        <label htmlFor="filter-category">Filter by Category:</label>
                        <select
                            id="filter-category"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="filter-date">Filter by Date:</label>
                        <input
                            type="date"
                            id="filter-date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((expense, index) => (
                                <tr key={index}>
                                    <td>{expense.category}</td>
                                    <td>{expense.amount}</td>
                                    <td>{expense.date}</td>
                                    <td>
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEditExpense(index)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteExpense(index)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td>Total:</td>
                                <td>{totalAmount}</td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {editModalOpen && (
                    <div className="modal" style={{ display: "flex" }}>
                        <div className="modal-content">
                            <span
                                className="close"
                                onClick={() => setEditModalOpen(false)}
                            >
                                ×
                            </span>
                            <h3>Edit Expense</h3>
                            <form onSubmit={handleSaveEdit}>
                                <label htmlFor="edit-category">Category:</label>
                                <select
                                    id="edit-category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                <label htmlFor="edit-amount">Amount:</label>
                                <input
                                    type="number"
                                    id="edit-amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                                <label htmlFor="edit-date">Date:</label>
                                <input
                                    type="date"
                                    id="edit-date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                                <button type="submit">Save Changes</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tracker;