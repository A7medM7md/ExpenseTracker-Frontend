import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style.css";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false); // حالة الـ Loading
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // التسجيل
            const registerResponse = await axios.post("https://localhost:7037/api/auth/register", {
                name: username,
                email,
                password,
            });
            alert(registerResponse.data.message);

            // تسجيل الدخول تلقائيًا بعد التسجيل
            const loginResponse = await axios.post("https://localhost:7037/api/auth/login", {
                email,
                password,
            });
            const { token, refreshToken, userId } = loginResponse.data;

            if (!token || !refreshToken || !userId) {
                throw new Error("Invalid login response from server");
            }

            // تخزين الـ Tokens في localStorage
            localStorage.setItem("accessToken", token);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("userId", userId);

            // الانتقال لصفحة Tracker
            navigate("/tracker");
        } catch (error) {
            const errorMessage = error.response?.data?.message || 
                                (error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join("\n") : "Registration or login failed");
            alert(errorMessage);
            console.error("Registration/Login error:", error.response);
        } finally {
            setIsLoading(false);
        }
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
                        disabled={isLoading}
                    />
                    <label htmlFor="register-email">Email</label>
                    <input
                        type="email"
                        id="register-email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <label htmlFor="register-password">Password</label>
                    <input
                        type="password"
                        id="register-password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Registering..." : "Register"}
                    </button>
                </form>
                <p>
                    Already have an account?<br/><br/>{" "}
                    <button onClick={() => navigate("/login")} className="link-button" disabled={isLoading}>
                        Login here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Register;