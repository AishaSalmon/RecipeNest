//Import all of the necessary functional components
import {useState} from "react";
import RN_logo from "../assets/RecipeNest.png"
import { getAuthHeaders } from "../utils/auth";
import "./Main.css";

type PostDiscussionPayload = {
    DiscussionTitle: string;
    DiscussionDescription:string;
}

type PostDiscussionProps = {
    onSuccess?: () => void;
}

//Export the Register page to app.tsx
//The postDiscussion page is responsible for allowing users to post new discussions to the platform.
//users can fill in a form to create a new discussion by entering a title and description. The page handles form submission, sends the data to the backend API,
//and provides feedback to the user regarding the success or failure of their discussion post.
// The component also manages loading states and error messages to enhance the user experience during the discussion posting process.
export default function PostDiscussion({ onSuccess }: PostDiscussionProps) {
    const API_URL = import.meta.env.VITE_API_URL;
    const [form, setForm] = useState<PostDiscussionPayload>({  //the form state for each field is initialized with empty string values.
        DiscussionTitle: "",
        DiscussionDescription: ""  
    })

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    //manages the form state for each field, updating the corresponding value in the form state whenever the user types into the input fields.
    function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    //when a user clicks the "Post Discussion" button, the onSubmit function is triggered. It prevents the default form submission behavior,
    //sets the loading state to true, and sends a POST request to the backend API with the discussion data.
    //the function handles the response from the API, updating the success or error state accordingly and resetting the form fields if the discussion is posted successfully.
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/discussion`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(), //authentication headers are included in the request to ensure that only authenticated users can post discussions.
                },
                body: JSON.stringify(form),
            });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
            throw new Error(data?.message || "Failed to post discussion");
        }

        setSuccess("Discussion posted successfully."); //when discussion is successfully posted, the form is reset to empty string values and a success message is displayed to the user.
        setForm({
            DiscussionTitle: "",
            DiscussionDescription: "",
        });
        window.setTimeout(() => {
            onSuccess?.();
        }, 800);

        } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
        } finally {
        setLoading(false);
        }
    }
 
    //Defining the PostDiscussion page functionality.
    return(
    //Define the PostDiscussion page as a modal, not a webpage.
        <section className="RegisterPage">
                <div className="Reg_card"> 
                    <div className="Reg_card_header">
                        <div className="logo">
                            <img src={RN_logo} alt = "Recipe Nest Logo" width = {40} height={40} />
                        </div>

                        <div>
                            <h2>Post new discussion</h2>
                            <p className="muted">Please Post a New Discussion to Share Your Culinary Ideas.</p>
                        </div>
                    </div>
                </div>
            
            
                <section className = "createPostDiscussionForm">
                    <form className="generalQuestions" onSubmit={onSubmit}>
                        <label className = "question"> Title
                            <input
                                type = "text"
                                name="DiscussionTitle"
                                value={form.DiscussionTitle}
                                onChange={onChange}
                                placeholder="Please enter the discussion title"
                            />
                        </label>

                        <label className = "question"> Description
                            <textarea
                                name="DiscussionDescription"
                                value={form.DiscussionDescription}
                                onChange={onChange}
                                placeholder="Please enter the discussion description"
                                rows={8}
                                style={{ resize: "none", borderRadius: "10px", padding: "10px" }}
                            />
                        </label>                    

                        <button className="post-discussion-button" type="submit" disabled={loading}> {/* //the button is disabled while the discussion is being posted to prevent multiple submissions. */}
                            {loading ? "Posting..." : "Post Discussion"}
                        </button>
                        {error && <p style={{ color: "crimson" }}>{error}</p>}
                        {success && <p style={{ color: "green" }}>{success}</p>}

                    </form>
                </section>
        </section>
    )
}