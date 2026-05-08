import {useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Main.css";
import Modal from "../components/modal/Modal";
import Register from "./Register";
import AuthLayout from "../components/AuthLayout";
import { saveAuthToken } from "../utils/auth";


//The login page allows users to log in to their account using their email and password. It also provides a link for users who have forgotten their password and an option to create a new account.
//The component manages the state of the form inputs, handles form submission, and displays any errors that occur during the login process.
export default function Login() {
    const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    //The function handles submitting the login form. It sends a POST request to the server with the user's email and password.
    //If the login is successful, it saves the authentication token and user information, then navigates to the home page. If there is an error, it displays an error message and the user tries again.
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "Login failed");
            }

            const token = data?.token || data?.accessToken || data?.jwt;

            if (!token) {
                throw new Error("No token was returned by the server.");
            }

            saveAuthToken(token);

            if (data?.user) {
                localStorage.setItem("recipenest_user", JSON.stringify(data.user));
            }

            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unexpected error");
        } finally {
            setLoading(false);
        }
    }

    return(
        <AuthLayout
            title="Welcome back"
            subtitle="Log in to manage your recipes and profile."
        >
                <form className = "form" onSubmit={handleSubmit}>
                    <label className = "email"> Email
                        <input
                            name = "email"
                            type = "email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>

                    <label className = "password"> password
                        <input
                            name = "password"
                            type = "password"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>

                    <button className="btnPrimary" type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                    {error && <p style={{ color: "crimson" }}>{error}</p>}
                </form>


                <Link
                    to="/forgot-password"
                    className="link"
                    style={{ display: 'inline-block', marginTop: '20px', marginBottom: '-5px', color: 'var(--terracotta)' }}
                >
                    Forgot password?
                </Link>


                <div className="row">
                    <span className="muted">New chef?</span>
                    <a 
                        href='#' className="link" 
                        onClick={(e)=> {
                            e.preventDefault();
                            setIsCreateAccountOpen(true);
                        }}
                        >
                            Create an account
                    </a>
                </div>
                
                <Modal
                    isOpen={isCreateAccountOpen}
                    onClose={() => setIsCreateAccountOpen(false)}
                    hasCloseButton={true}
                    >
                        <Register onSuccess={() => setIsCreateAccountOpen(false)} />
                </Modal>

                <p className="tiny muted">
                    By continuing, you agree to our Terms and Privacy Policy.
                </p>
        </AuthLayout>
    )
}