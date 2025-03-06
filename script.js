const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const trackerPage = document.getElementById('tracker-page');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');

// Store Users Data In Local Storage
let users = JSON.parse(localStorage.getItem('users')) || [];

function showPage(page) {
    loginPage.classList.remove('active');
    registerPage.classList.remove('active');
    trackerPage.classList.remove('active');
    page.classList.add('active');
}

showRegister.addEventListener('click', function(e) {
    e.preventDefault(); // Prevent Refresh
    showPage(registerPage);
});

showLogin.addEventListener('click', function(e) {
    e.preventDefault();
    showPage(loginPage);
});

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        showPage(trackerPage);
    } else {
        alert('Invalid email or password');
    }
});

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (users.some(u => u.email === email)) {
        alert('Email already exists');
        return;
    }

    if (users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }

    users.push({ username, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Please login.');
    showPage(loginPage);
});

// Logout
logoutBtn.addEventListener('click', function() {
    showPage(loginPage);
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    expenses = []; 
    updateTable();
});

// Expenses

let expenses = [];
let totalAmount = 0;
let currentEditIndex = -1;

const categorySelect = document.getElementById('category-select');
const amountInput = document.getElementById('amount-input');
const dateInput = document.getElementById('date-input');
const addBtn = document.getElementById('add-btn');
const expensesTableBody = document.getElementById('expense-table-body');
const totalAmountCell = document.getElementById('total-amount');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editCategory = document.getElementById('edit-category');
const editAmount = document.getElementById('edit-amount');
const editDate = document.getElementById('edit-date');
const closeModal = document.getElementById('close-modal');
const filterCategory = document.getElementById('filter-category');
const filterDate = document.getElementById('filter-date');

function updateTable() {
    expensesTableBody.innerHTML = '';
    totalAmount = 0;

    const selectedCategory = filterCategory.value;
    const selectedDate = filterDate.value;

    const filteredExpenses = expenses.filter(expense => {
        const categoryMatch = !selectedCategory || expense.category === selectedCategory;
        const dateMatch = !selectedDate || expense.date === selectedDate;
        return categoryMatch && dateMatch;
    });

    filteredExpenses.forEach((expense, index) => {
        totalAmount += expense.amount;
        const newRow = expensesTableBody.insertRow();

        const categoryCell = newRow.insertCell();
        const amountCell = newRow.insertCell();
        const dateCell = newRow.insertCell();
        const actionsCell = newRow.insertCell();

        categoryCell.textContent = expense.category;
        amountCell.textContent = expense.amount;
        dateCell.textContent = expense.date;

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', () => editExpense(expenses.indexOf(expense)));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => deleteExpense(expenses.indexOf(expense)));

        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
    });

    totalAmountCell.textContent = totalAmount;
}

addBtn.addEventListener('click', function() {
    const category = categorySelect.value;
    const amount = Number(amountInput.value);
    const date = dateInput.value;

    if (category === '') {
        alert('Please select a category');
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    if (date === '') {
        alert('Please select a date');
        return;
    }

    expenses.push({ category, amount, date });
    amountInput.value = '';
    dateInput.value = '';
    updateTable();
});

function editExpense(index) {
    currentEditIndex = index;
    const expense = expenses[index];

    editCategory.value = expense.category;
    editAmount.value = expense.amount;
    editDate.value = expense.date;

    editModal.style.display = 'flex';
}

editForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const newCategory = editCategory.value;
    const newAmount = Number(editAmount.value);
    const newDate = editDate.value;

    if (newCategory && !isNaN(newAmount) && newAmount > 0 && newDate) {
        expenses[currentEditIndex] = { category: newCategory, amount: newAmount, date: newDate };
        editModal.style.display = 'none';
        updateTable();
    } else {
        alert('Please enter valid values');
    }
});

closeModal.addEventListener('click', function() {
    editModal.style.display = 'none';
});

window.addEventListener('click', function(e) {
    if (e.target === editModal) {
        editModal.style.display = 'none';
    }
});

function deleteExpense(index) {
    expenses.splice(index, 1);
    updateTable();
}

filterCategory.addEventListener('change', updateTable);
filterDate.addEventListener('change', updateTable);

updateTable();