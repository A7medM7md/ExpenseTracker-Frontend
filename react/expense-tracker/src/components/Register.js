import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        let users = JSON.parse(localStorage.getItem("users")) || [];

        if (users.some((u) => u.email === email)) {
            alert("Email already exists");
            return;
        }
        if (users.some((u) => u.username === username)) {
            alert("Username already exists");
            return;
        }

        users.push({ username, email, password });
        localStorage.setItem("users", JSON.stringify(users));
        alert("Registration successful! Please login.");
        navigate("/login");
    };

    return (
        <div className="page active">
            <div className="auth-container">
                <h1>Create Account</h1>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="register-username">Username</label>
                    <input
                        type="text"
                        id="register-username"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <label htmlFor="register-email">Email</label>
                    <input
                        type="email"
                        id="register-email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label htmlFor="register-password">Password</label>
                    <input
                        type="password"
                        id="register-password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Register</button>
                </form>
                <p>
                    Already have an account?{" "}
                    <a href="#" onClick={() => navigate("/login")}>
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Register;