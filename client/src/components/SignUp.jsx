import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SignUp.css";
import image from "../assets/image1.png";

const SignupPage = () => {
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const name = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const confirmPassword = e.target[3].value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("https://project-management-app-89n4.onrender.com/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("✅ Signup successful");
        navigate("/dashboard");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <img src={image} alt="Join Us Illustration" className="signup-image" />
      </div>

      <div className="signup-right">
        <h2 className="signup-title">Join Us!</h2>
        <h3 className="signup-subtitle">
          Stay connected, stay productive, and reach milestones together.
        </h3>

        <form className="signup-form" onSubmit={handleSignup}>
          <label>Full Name</label>
          <input type="text" placeholder="Enter your full name" required />

          <label>Email</label>
          <input type="email" placeholder="Enter your email" required />

          <label>Password</label>
          <input type="password" placeholder="Enter your password" required />

          <label>Confirm Password</label>
          <input type="password" placeholder="Confirm your password" required />

          <button type="submit" className="signup-btn">Sign Up</button>

          <button
            type="button"
            className="google-btn"
            onClick={() => window.open("https://project-management-app-89n4.onrender.com/api/users/google", "_self")}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              style={{ width: 20, height: 20 }}
            />
            Sign up with Google
          </button>
        </form>

        <p className="signin-text">
          Already have an account? <a href="/login">Sign In</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;