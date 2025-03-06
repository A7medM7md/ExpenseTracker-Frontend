import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";

const Login = ({ setIsAuthenticated }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(
            (u) => u.email === email && u.password === password
        );
        if (user) {
            setIsAuthenticated(true);
            navigate("/tracker");
        } else {
            alert("Invalid email or password");
        }
    };

    return (
        <div className="page active">
            <div className="auth-container">
                <h1>Welcome Back</h1>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="login-email">Email</label>
                    <input
                        type="email"
                        id="login-email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label htmlFor="login-password">Password</label>
                    <input
                        type="password"
                        id="login-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
                <p>
                    Don't have an account?{" "}
                    <a href="#" onClick={() => navigate("/register")}>
                        Register here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;