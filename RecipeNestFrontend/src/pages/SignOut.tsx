import {useNavigate} from "react-router-dom";
import {useState} from "react";
import HomeLayout from "../components/HomeLayout";
import RN_logo from "../assets/RecipeNest.png";
import "./Home.css";
import { getAuthToken, clearAuthToken } from "../utils/auth";


//The sign out page is responsible for handlign the user sign out process.
//When a user clicks on the sign out button, the handleSignOut function is triggered. This function checks if the user is currently signed in by verifying the presence of an authentication token.
//If a token is found, it clears the token from local storage, effectively signing the user out.
//The function also manages loading and error states to provide feedback to the user during the sign-out process. Finally, it redirects the user to the login page after signing out.

export default function SignOut(){
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    //the handleSignOut function is responsible for handling the user sign out process. When a user clicks on the sign out button, this function is triggered.
    // It checks if the user is currently signed in by verifying the presence of an authentication token. If a token is found, it clears the token from local storage, 
    // requiring the user to login again so that another JWT token can be generated to be used for subsequent requests to the backend.
    // The function also manages loading and error states to provide feedback to the user during the sign-out process. Finally, it redirects the user to the login page after signing out.
    async function handleSignOut() {
        setError("");
        const confirmed = window.confirm("Are you sure you want to sign out?");
        if (!confirmed) {
            return;
        }

        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error("You are not signed in.");
            }
            
            clearAuthToken();
            
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred while signing out.");
        } finally {
            setLoading(false);
            navigate("/login");
        }
    }


    // The component renders a confirmation message asking the user if they are sure they want to sign out, along with a sign-out button and a cancel button.
    return(
       <HomeLayout
        topLayer={
            <div className="top_heading2" style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                  <img src={RN_logo} alt="Recipe Nest Logo" width={32} height={32} />
                    <h3>Sign Out</h3>
            </div>
        }
        pageContent={
            <div className="sign-out-content">
                <div className = "content">
                    <h1>Are you sure you want to sign out?</h1>
                    <p>You will need to log in again to access your account.</p>
                    {error && <p className="error">{error}</p>}
                    <div className="sign-out-actions" style={{display: "flex", justifyContent: "center", gap: "1rem"}}>
                        <button onClick={handleSignOut} disabled={loading}>
                            {loading ? "Signing Out..." : "Sign Out"}
                        </button>
                        <button onClick={() => navigate("/")}>Cancel</button>
                    </div>
                </div>
            </div>
         }>

       </HomeLayout>
    )
}