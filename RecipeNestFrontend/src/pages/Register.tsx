//Import all of the necessary functional components
import {useState} from "react";
import RN_logo from "../assets/RecipeNest.png"
import "./Main.css";

//the register payload defines the structure of the data that will be sent to the backend when a user attempts to register for an account.
//It includes fields for the user's first name, last name, email, username, and password.
type RegisterPayload = {
    firstName: string;
    lastName:string;
    email: string;
    userName: string;
    password: string;
}

//the props includes an optional onSuccess callback function that can be executed after a successful registration.
// This allows the parent component to perform additional actions, such as redirecting the user to a different page or displaying a success message, once the registration process is complete.
type RegisterProps = {
    onSuccess?: () => void;
}

//Export the Register page to app.tsx
export default function Register({ onSuccess }: RegisterProps) {
    const [confirmPassword, setConfirmPassword] = useState("");
    const API_URL = import.meta.env.VITE_API_URL;
    const [form, setForm] = useState<RegisterPayload>({  //the form state is initialized with empty strings for all fields, and it will be updated as the user fills the registration form.
        firstName: "",
        lastName: "",
        email: "",
        userName: "",
        password: ""
    })

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    //the onChange function is responsible for updating the form state whenever the user types into any of the input fields. It ensures consistent update of the fields.
    //When a user types into the input fieds, the onChange pairs the name of the input field and its value to update the corresponding field in the form state, allowing for a dynamic and responsive form experience.
    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    //the onSubmit function is triggered when the user submits the registration form. It performs several key actions:
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault(); //it prevents the default form submission behaviour, which would cause a page reload.
        setError(""); //sets the error state to an empty string.
        setSuccess(""); //sets the success state to an empty string.
        setLoading(true);

        try {
            if (form.password !== confirmPassword) { //validating that the password fields match before sending the registration request to the backend.
                setError("Passwords do not match");
                setLoading(false);
                return;
                }

                //sending a POST request to the backend API to create a new user account with the data collected from the registration form. The request includes the form data in JSON format.
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "Registration failed");
            }

            setSuccess("Account created successfully."); //displays a success message to the user upon successful registration, it clears after 2 seconds.
            window.setTimeout(() => {
                onSuccess?.();
            }, 800);

        } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error"); //displays an error message to the user if the registration fails
        } finally {
        setLoading(false);
        }
    }
 
    //Defining the Register page functionality.
    return(
    //Define the Register page as a modal, not a webpage.
        <section className="RegisterPage">
                <div className="Reg_card">
                    <div className="Reg_card_header">
                        <div className="logo">
                            <img src={RN_logo} alt = "Recipe Nest Logo" width = {40} height={40} />
                        </div>

                        <div>
                            <h2>Welcome to RecipeNest</h2>
                            <p className="muted">Please Register To Join Fellow Culinary Professionals.</p>
                            <p style={{display: "flex", alignItems: "flex-start", fontSize: "16px", color: "crimson"}}>Password Requirements</p>
                            <ul style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
                                <li>Minimum of 8 characters</li>
                                <li>At least one uppercase letter</li>
                                <li>At least one lowercase letter</li>
                                <li>At least one number</li>
                                <li>At least one special character (!@#$%)</li>
                                <li>Must contain at least one unique character</li>
                            </ul>
                            <p style={{display: "flex", alignItems: "flex-start", fontSize: "16px", color: "crimson"}}>A valid email address can only be used for one account</p>
                        </div>
                    </div>
                </div>
            
                {/* //Form to collect the user's registration information, including their first name, last name, email, phone number, and password.
                //The form includes validation to ensure that the password and confirm password fields match before allowing submission.
                //Upon submission, the form data is sent to the backend API to create a new user account, and appropriate success or error messages are displayed based on the response from the server. */}
                <section className = "createAccountForm">
                    <form className="generalQuestions" onSubmit={onSubmit}>
                        <label className = "question"> First Name
                            <input type = "text" name="firstName" onChange={onChange} placeholder="Please enter your first name"/>
                        </label>

                        <label className = "question"> Last Name
                            <input type = "text"name="lastName" onChange={onChange} placeholder="Please enter your last name"/>
                        </label>                    

                        <label className = "question"> Email Address
                            <input type = "email" name="email" onChange={onChange} placeholder="Please enter your email"/>
                        </label>
                        
                        <label className = "question">Phone Number
                            <input name="phoneNumber" type = "text" onChange={onChange} placeholder="Phone number"/>
                        </label>

                        <label className = "question"> Password
                            <input type = "password" name="password" onChange={onChange} placeholder="Your password" value={form.password}/> {/* value = {password}/> //onChange={e => setPassword(e.target.value)>*/}
                        </label>

                        <label className = "question"> Re-enter Password
                            <input type = "password" placeholder="........" name="confirm password" value = {confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
                        </label>

                        <button className="post-discussion-button" type="submit" disabled={loading}>
                            {loading ? "Registering..." : "Register"}
                        </button>
                        {error && <p style={{ color: "crimson" }}>{error}</p>}
                        {success && <p style={{ color: "green" }}>{success}</p>}

                    </form>

                    <p className="tiny muted">
                        By continuing, you agree to our Terms and Privacy Policy.
                    </p>
                </section>
        </section>
    )
}