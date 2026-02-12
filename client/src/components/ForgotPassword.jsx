import React from "react";
import "../styles/ForgotPassword.css";
import image from "../assets/image3.png";

// Page for password recovery
const ForgotPasswordPage = () => {
  return (
    <div className="forgot-container">
        <div className="forgot-left">
            <img
            src={image}
            alt="Forgot Password Illustration"
            className="forgot-illustration"
            />
        </div>
        <div className="forgot-right">
            <h2 className="forgot-title">Forgot Password?</h2>
            <h3 className="forgot-subtitle">
            Don’t worry! Enter your email and we’ll send you a reset link.
            </h3>

            <form className="forgot-form">
            <label>Email</label>
            <input
                type="email"
                placeholder="Enter your email"
                required
            />

            <button type="submit" className="forgot-btn">
                Send Reset Link
            </button>
            </form>

            <p className="back-to-login">
            Remember your password? <a href="/login">Sign In</a>
            </p>
        </div>
    </div>
  );
};

export default ForgotPasswordPage;
