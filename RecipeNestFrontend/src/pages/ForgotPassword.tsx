import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Main.css";
import AuthLayout from "../components/AuthLayout";
import ResetPassword from "./ResetPassword";

//the formgotPassowrd function is responsible for handling the forgot password functionality of the application. It allows users to enter their email address and receive a password reset link.
//this component manages the state of the email input and on clicking on the submit button, it sends a request to the backend API to trigger the password reset proecess.
//it provides feedback to the user to check their email for reset link upon sucess, and handles error cases by displaying appropriate error messages.

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    //when a user submits the forgot password form, the handleSubmit function is called
    //It validates the email input, sends a POST request to the backend API to initiate the password reset process, and handles the response to provide feedback to the user.
    //If the request is successful, it displays a success message and redirects the user to the reset password page after a short delay. If there's an error, it displays an appropriate error message.
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setSuccess("");

        if (!email.trim()) {
            setMessage("Please enter your email address.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email: email.trim()}),
            })
            const data = await res.json().catch(()=>null);
            
            if (!res.ok){
                throw new Error(data?.message || "Unable to send reset link");
            }

            setSuccess("Reset email sent. Please check your email.");
            window.setTimeout(() => {
                navigate("/reset-password");
            }, 800);

            <ResetPassword />
            

        } catch (err) {
            setMessage(err instanceof Error? err.message: "An error occured");
        }finally{
            setLoading(false);
        }
    }

    //the return statement renders the forgot password form which include input fields for user email and a submit button.
    //It displays success and error messages based on component state, and provides users with a link to navigate back to login page if they remember their password.
    //the form is wrapped in an AuthLayout component which provides a consistent layout and styling for authentication-related pages.
    return (
        <AuthLayout
            title="Forgot password"
            subtitle="Enter your email to receive a password reset link."
        >
            <form className="ResetPassword" onSubmit={handleSubmit}>
                <label>Email
                    <input
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>

                <button className="resetPasswordButton" type="submit" disabled = {loading}>
                    {loading? "Sending...": "Send reset link"}
                </button>
            </form>

            {message && <p style={{ color: "crimson" }}>{message}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

            <p className="tiny muted">
                Remembered your password? <Link className="link" to="/login" style={{ color: 'var(--terracotta)' }}>Back to login</Link>
            </p>
        </AuthLayout>
    )
}