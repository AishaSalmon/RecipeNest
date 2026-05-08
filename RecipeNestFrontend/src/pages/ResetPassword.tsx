import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

type ResetPasswordPayload = {
  email: string;
  token: string;
  newPassword: string;
};

//this page is responsible for allowing users to reset their password.
//it uses the token sent to the user via email to verify the user password reset request. From the token, the email is also obtained and pre-filled in the form. The user then enters a new password and confirms it before submitting the form.
//it then requires the user to enter a new password and confirm it before submitting the reset password request to the backend API. The page also handles loading states, error messages, and success notifications to provide feedback to the user throughout the process.
export default function ResetPassword() {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState<ResetPasswordPayload>({
    email: "",
    token: "",
    newPassword: "",
  });

  //Getting token and email from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setForm((prev) => ({
      ...prev,
      email: params.get("email") || "",
      token: params.get("token") || "",
    }));
  }, []);

  //the onChange function updates the form state whenever the user types into the input fields. It uses the name attribute of the input elements to determine which field to update in the form state.
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // The form submission sends a request to the backend API to reset the user's password, and based on the response, it provides feedback to the user about the success or failure of the operation.
  // If successful, it redirects the user to the login page after a short delay.
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (form.newPassword !== confirmPassword) { //validating that the password fields match before sending the reset password request to the backend.
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    //sending the reset password request to the backend API with the email, token, and new password provided by the user. The backend will verify the token and reset the password if everything is valid.
    //The frontend then handles the response to inform the user of the outcome.
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Reset password failed");
      }

      setSuccess("Password reset successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 800); // Redirecting to login page after successful password reset

    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  //the component renders a form with input fields for email, the new password, and confirm password. It also displays error and success messages based on the outcome of the password reset request.
  return (
    <AuthLayout
        title = "Reset password"
        subtitle = "Please enter a new password">

        <form className="forgotPasswordForm" onSubmit={onSubmit}>
            <h3>Reset Password</h3>

            <label>Email
                <input type="email" value={form.email} readOnly />
            </label>

            <label>New password
                <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={onChange}
                />
            </label>

            <label>Confirm password
                <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </label>

            <button type="submit" className="resetPasswordButton" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
            </button>

            {error && <p style={{ color: "crimson" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
        </form>
        </AuthLayout>
    
  );
}