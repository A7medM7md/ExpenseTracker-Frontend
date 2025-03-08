import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style.css";

const Tracker = ({ setIsAuthenticated }) => {
    const [expenses, setExpenses] = useState([]);
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [description, setDescription] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [editIndex, setEditIndex] = useState(-1);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [exchangeRates, setExchangeRates] = useState(null);
    const [convertToCurrency, setConvertToCurrency] = useState("EGP");
    const [convertedAmount, setConvertedAmount] = useState("");
    const navigate = useNavigate();

    const categories = ["Food & Beverage", "Rent", "Transport", "Relaxing", "Other"];
    const currencies = ["USD", "EGP", "EUR", "SAR"];

    const handleLogout = useCallback(() => {
        setIsAuthenticated(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        navigate("/login");
    }, [setIsAuthenticated, navigate]);

    useEffect(() => {
        const axiosInterceptor = axios.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const refreshToken = localStorage.getItem("refreshToken");
                        const response = await axios.post("https://localhost:7037/api/auth/refresh-token", {
                            refreshToken
                        });
                        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;
                        localStorage.setItem("accessToken", newAccessToken);
                        localStorage.setItem("refreshToken", newRefreshToken);
                        setIsAuthenticated(true);
                        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        console.error("Failed to refresh token:", refreshError);
                        handleLogout();
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(axiosInterceptor);
        };
    }, [setIsAuthenticated, handleLogout]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");

        const fetchExchangeRates = async () => {
            try {
                const response = await axios.get("https://localhost:7037/api/currency/rates", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setExchangeRates(response.data.conversion_rates);
            } catch (error) {
                console.error("Error fetching exchange rates:", error);
                alert("Failed to fetch exchange rates. Currency conversion will be unavailable.");
            }
        };

        const fetchExpenses = async () => {
            try {
                const response = await axios.get("https://localhost:7037/api/expenses", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        UserId: userId,
                    },
                });
                setExpenses(response.data);
            } catch (error) {
                console.error("Error fetching expenses:", error.response);
            }
        };

        const now = new Date();
        setDateTime(now.toISOString().slice(0, 16));

        if (token && userId) {
            fetchExpenses();
            fetchExchangeRates();
        } else {
            handleLogout();
        }
    }, [handleLogout]);

    useEffect(() => {
        if (!exchangeRates || !amount || !currency || !convertToCurrency) {
            setConvertedAmount("");
            return;
        }

        const amountNum = Number(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setConvertedAmount("");
            return;
        }

        const rateToEGP = exchangeRates[currency] || 1;
        const amountInEGP = amountNum * (1 / rateToEGP);
        const rateToTarget = exchangeRates[convertToCurrency] || 1;
        const converted = amountInEGP * rateToTarget;
        setConvertedAmount(converted.toFixed(2));
    }, [amount, currency, convertToCurrency, exchangeRates]);

    const handleAddExpense = async () => {
        if (!category || !amount || !dateTime || !convertToCurrency) {
            alert("Please fill all required fields");
            return;
        }
        const amountNum = Number(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        const fullDateTime = new Date(dateTime).toISOString();
        const token = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");

        let finalAmount = amountNum;
        if (currency !== convertToCurrency && exchangeRates) {
            const rateToEGP = exchangeRates[currency] || 1;
            const amountInEGP = amountNum * (1 / rateToEGP);
            const rateToTarget = exchangeRates[convertToCurrency] || 1;
            finalAmount = amountInEGP * rateToTarget;
        }

        try {
            const response = await axios.post(
                "https://localhost:7037/api/expenses",
                {
                    category,
                    amount: Number(finalAmount.toFixed(2)),
                    currency: convertToCurrency,
                    description,
                    date: fullDateTime,
                    userId: parseInt(userId),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        UserId: userId,
                    },
                }
            );
            setExpenses([...expenses, response.data]);
            resetForm();
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to add expense";
            alert(errorMessage);
            console.error("Error adding expense:", error.response);
        }
    };

    const handleDeleteExpense = async (index) => {
        const expenseId = expenses[index].id;
        const token = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");

        try {
            await axios.delete(`https://localhost:7037/api/expenses/${expenseId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    UserId: userId,
                },
            });
            setExpenses(expenses.filter((_, i) => i !== index));
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to delete expense";
            alert(errorMessage);
            console.error("Error deleting expense:", error.response);
        }
    };

    const handleEditExpense = (index) => {
        setEditIndex(index);
        const expense = expenses[index];
        setCategory(expense.category);
        setAmount(expense.amount);
        setCurrency(expense.currency || "USD");
        setConvertToCurrency(expense.currency || "EGP");
        setDescription(expense.description || "");
        const expenseDateTime = new Date(expense.date);
        setDateTime(expenseDateTime.toISOString().slice(0, 16));
        setEditModalOpen(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        const amountNum = Number(amount);
        if (!amount || isNaN(amountNum) || amountNum <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        if (!dateTime) {
            alert("Please select a date and time");
            return;
        }

        const expenseId = expenses[editIndex].id;
        const fullDateTime = new Date(dateTime).toISOString();
        const token = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");

        let finalAmount = amountNum;
        if (currency !== convertToCurrency && exchangeRates) {
            const rateToEGP = exchangeRates[currency] || 1;
            const amountInEGP = amountNum * (1 / rateToEGP);
            const rateToTarget = exchangeRates[convertToCurrency] || 1;
            finalAmount = amountInEGP * rateToTarget;
        }

        try {
            const response = await axios.put(
                `https://localhost:7037/api/expenses/${expenseId}`,
                {
                    id: expenseId,
                    category,
                    amount: Number(finalAmount.toFixed(2)),
                    currency: convertToCurrency,
                    description,
                    date: fullDateTime,
                    userId: parseInt(userId),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        UserId: userId,
                    },
                }
            );
            const updatedExpenses = expenses.map((exp, i) =>
                i === editIndex ? response.data : exp
            );
            setExpenses(updatedExpenses);
            setEditModalOpen(false);
            resetForm();
            setEditIndex(-1);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to update expense";
            alert(errorMessage);
            console.error("Error updating expense:", error.response);
        }
    };

    const resetForm = () => {
        setCategory("");
        setAmount("");
        setCurrency("USD");
        setDescription("");
        setConvertToCurrency("EGP");
        const now = new Date();
        setDateTime(now.toISOString().slice(0, 16));
    };

    const filteredExpenses = expenses.filter((expense) => {
        const categoryMatch = !filterCategory || expense.category === filterCategory;
        const expenseDate = new Date(expense.date);
        const filterDateObj = filterDate ? new Date(filterDate) : null;
        const dateMatch = !filterDate || (
            expenseDate.getFullYear() === filterDateObj.getFullYear() &&
            expenseDate.getMonth() === filterDateObj.getMonth() &&
            expenseDate.getDate() === filterDateObj.getDate()
        );
        return categoryMatch && dateMatch;
    });

    const totalAmount = parseFloat(filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(3));

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className="page active">
            <div className="tracker-container">
                <div className="user-panel">
                    <button onClick={handleLogout}>Logout</button>
                </div>
                <h1>Expense Tracker</h1>
                <div className="input-section">
                    <div className="form-content">
                        <div className="form-row top-row">
                            <select
                                id="category-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
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
                                required
                            />
                            <label htmlFor="currency-select">Currency:</label>
                            <select
                                id="currency-select"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                required
                            >
                                {currencies.map((curr) => (
                                    <option key={curr} value={curr}>
                                        {curr}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-row conversion-row">
                            <label htmlFor="convert-to-select">Your Currency:</label>
                            <select
                                id="convert-to-select"
                                value={convertToCurrency}
                                onChange={(e) => setConvertToCurrency(e.target.value)}
                            >
                                {currencies.map((curr) => (
                                    <option key={curr} value={curr}>
                                        {curr}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                id="converted-amount"
                                value={convertedAmount ? `${convertedAmount} ${convertToCurrency}` : "N/A"}
                                readOnly
                            />
                        </div>
                        <div className="form-row bottom-row">
                            <input
                                type="datetime-local"
                                id="datetime-input"
                                value={dateTime}
                                onChange={(e) => setDateTime(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                id="description-input"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter description"
                            />
                        </div>
                        <button className="add-expense-btn" onClick={handleAddExpense}>
                            Add
                        </button>
                    </div>
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
                                <th>Currency</th>
                                <th>Description</th>
                                <th>Date & Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((expense, index) => (
                                <tr key={expense.id}>
                                    <td>{expense.category}</td>
                                    <td>{expense.amount}</td>
                                    <td>{expense.currency}</td>
                                    <td>{expense.description || "-"}</td>
                                    <td>{formatDateTime(expense.date)}</td>
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
                                <td></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {editModalOpen && (
                    <div className="modal" style={{ display: "flex" }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Edit Expense</h3>
                                <span className="close" onClick={() => setEditModalOpen(false)}>
                                    ×
                                </span>
                            </div>
                            <div className="modal-body">
                                <form id="edit-form" onSubmit={handleSaveEdit}>
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
                                    />
                                    <label htmlFor="edit-currency">Currency:</label>
                                    <select
                                        id="edit-currency"
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                    >
                                        {currencies.map((curr) => (
                                            <option key={curr} value={curr}>
                                                {curr}
                                            </option>
                                        ))}
                                    </select>
                                    <label htmlFor="edit-convert-to">Your Currency:</label>
                                    <select
                                        id="edit-convert-to"
                                        value={convertToCurrency}
                                        onChange={(e) => setConvertToCurrency(e.target.value)}
                                    >
                                        {currencies.map((curr) => (
                                            <option key={curr} value={curr}>
                                                {curr}
                                            </option>
                                        ))}
                                    </select>
                                    <label htmlFor="edit-description">Description:</label>
                                    <input
                                        type="text"
                                        id="edit-description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Enter description"
                                    />
                                    <label htmlFor="edit-datetime">Date & Time:</label>
                                    <input
                                        type="datetime-local"
                                        id="edit-datetime"
                                        value={dateTime}
                                        onChange={(e) => setDateTime(e.target.value)}
                                    />
                                    <button type="submit">Save Changes</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tracker;