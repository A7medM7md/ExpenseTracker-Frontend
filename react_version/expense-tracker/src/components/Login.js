import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style.css";

const Login = ({ setIsAuthenticated }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post("https://localhost:7037/api/auth/login", {
                email,
                password,
            });
            console.log("Login response:", response.data);
            if (response.status === 200) {
                const { token, refreshToken, userId } = response.data;
                if (!token || !refreshToken || !userId) {
                    throw new Error("Invalid response from server");
                }
                setIsAuthenticated(true);
                localStorage.setItem("accessToken", token); // Access Token
                localStorage.setItem("refreshToken", refreshToken); // Refresh Token
                localStorage.setItem("userId", userId);
                navigate("/tracker");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.errors?.flat().join("\n") ||
                "Invalid email or password";
            console.error("Login error:", error.response);
            alert(errorMessage);
        } finally {
            setIsLoading(false);
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
                        disabled={isLoading}
                    />
                    <label htmlFor="login-password">Password</label>
                    <input
                        type="password"
                        id="login-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p>
                    Don't have an account?<br/><br/>{" "}
                    <button onClick={() => navigate("/register")} className="link-button" disabled={isLoading}>
                        Register here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;