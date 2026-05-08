import HomeLayout from "../components/HomeLayout";
import RN_logo from "../assets/RecipeNest.png";
import {useState, useEffect} from "react";
import type { ChefProfile } from "../types/ChefProfile";
import { getAuthToken } from "../utils/auth";
import DefaultProfile from "../assets/default-profile.png";
import { useNavigate } from "react-router-dom";
import Modal from "../components/modal/Modal";
import "./Home.css";


//the dashboard page is where chefs can manage their profiles and recipes.
//it allows chefs to create new profiles if they havent, and edit or delete existing profiles.
//chefs can also navigate to the manage recipes page to handle their recipes.
//The dashboard page fetches the chef's profile data from the backend API and displays it, along with options to edit or delete the profile.
//It also provides feedback to the user through loading states, error messages, and success notifications during interactions with the profile management features.
export default function ViewDashboard(){
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    if (!API_URL) {
        throw new Error("VITE_API_URL is not set");
    }

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [chefName, setChefName] = useState("");
    const [chefProfile, setChefProfile] = useState<ChefProfile | null>(null);
    const [form, setForm] = useState({
        ProfessionalTitle: "",
        Bio: "",
        ProfileImageURL: null as File | null,
        IsProfileVisible: true,
    });

    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCreateProfile, setShowCreateProfile] = useState(false);

    useEffect(() => {
        fetchChefProfile();
    }, []);


    //the onChange function is responsible for handling changes to the form inputs when creating or editing a chef profile.
    //It updates on whether it is a text, file or text area input.
    function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name } = e.target;
       if(e.target instanceof HTMLInputElement && e.target.type === "file"){
            const file = e.target.files?.[0] || null;
            setForm((prev) => ({ ...prev, [name]: file }));
        } else if(e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement){
            setForm((prev) => ({ ...prev, [name]: e.target.value }));
        }
    }

    //this function handles the form submission for creating a new profile. It validates the form inputs.
    //it sends a POST request to the backend API with the form data, and provides feedback to the user based on the success or failure of the profile creation process.
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        
        if(!form.ProfessionalTitle || !form.Bio){ //validates that all required fields are filled.
            setError("Please fill in all required fields (Professional Title and Bio)");
            setLoading(false);
            return;
        }

        try{ //trying to make a call to the backend API to create a new chef profile with the provided form data.
            const token = getAuthToken();
            if(!token){
                setError("User not authenticated. Please log in.");
                navigate("/login");
                return;
            }

            const formData = new FormData();
            formData.append("ProfessionalTitle", form.ProfessionalTitle);
            formData.append("Bio", form.Bio);
            formData.append("IsProfileVisible", String(form.IsProfileVisible));
            if (form.ProfileImageURL) {
                formData.append("ProfileImageURL", form.ProfileImageURL);
            }

            const res = await fetch(`${API_URL}/ChefProfile`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`, // Include the authentication token in the request headers to authorize the profile creation.
                },
                body: formData,
            });

            const rawText = await res.text();
            let data: any = null;

            try { //handling the response from the backend API. It attempts to parse the response as JSON, but if parsing fails, it treats the response as plain text.
                data = rawText ? JSON.parse(rawText) : null;
            } catch {
                data = rawText;
            }

            if (!res.ok) {
                throw new Error((typeof data === "string" && data) || data?.message || "Failed to create chef profile");
            }

            setSuccess("Chef profile created successfully");
            setShowCreateProfile(false);
            fetchChefProfile(); //upon successful creating of the profile, it fetches the updated chef profile and displays it on the dashboard immediately. this calls the fechChrefProfile function to get the latest profile data.
        }catch(err){
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        }finally{
            setLoading(false);
        }
    }


    //when the dashboard page loads, it calls the this function to fetch the chef's profile data from the backend and renders it appropriately in the UI.
    async function fetchChefProfile() {
        setLoading(true);
        setError("");
        setSuccess("");

        try{
            const token = getAuthToken();
            if(!token){ //if the user is not logged in or the authentication token is missing, it sets an error message and redirects the user to the login page.
                setError("User not authenticated. Please log in.");
                navigate("/login");
                return;
            }

            const res = await fetch(`${API_URL}/ChefProfile`, { //sending a GET request to the backend API to retrieve the chef's profile data.
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) { //if the respons is not found, it returns a null profile.
                if (res.status === 404) {
                    setChefProfile(null);
                    setChefName("");
                    return;
                }

                const rawText = await res.text();
                let data: any = null;

                try {
                    data = rawText ? JSON.parse(rawText) : null;
                } catch {
                    data = rawText;
                }

                throw new Error((typeof data === "string" && data) || data?.message || "Failed to fetch chef profile");                
            }

            const data: ChefProfile = await res.json();

            setChefProfile(data); //if teh profile data is successfully retrieved, it updates the state with the chef's profile information. It also sets the chef's name for display purposes on the dashboard.
            setForm({ //it updates the form state with the retrieve profile data, so that when a chef attempts to edit their profile, the form is pre-filled and allows appropriate edit.
                ProfessionalTitle: data.professionalTitle ?? "",
                Bio: data.bio ?? "",
                IsProfileVisible: data.isProfileVisible ?? (data as any).IsProfileVisible ?? true,
                ProfileImageURL: null,
            });
            setChefName(`${data.firstName ?? ""} ${data.lastName ?? ""}`.trim());

            setSuccess("Chef profile fetched successfully"); //sets success message
            setTimeout(() => setSuccess(""), 2000);//clears success message after 2 seconds

        } catch (error) {
            setError((error as Error).message); //sets error message.
        } finally {
            setLoading(false);

        }
    }

    //this function handles the submission of the edit profile form. It sends a PUT request to the backend API with the updated profile data and provides appropriate feedback.
    async function onEditProfile() {
        setError("");
        setSuccess("");
        setLoading(true);

        try{
            const token = getAuthToken();
            if(!token){ //ensures user is signed in before allowing htem the edit their profile. If not authenticated, it sets an error message and redirects to the login page.
                setError("User not authenticated. Please log in.");
                navigate("/login");
                return;
            }

            const formData = new FormData(); //constructs a formdata object with the updated profile data from the form state.
            formData.append("ProfessionalTitle", form.ProfessionalTitle);
            formData.append("Bio", form.Bio);
            formData.append("IsProfileVisible", String(form.IsProfileVisible));
            if (form.ProfileImageURL) {
                formData.append("ProfileImageURL", form.ProfileImageURL);
            }

            //it sends a PUT request to the backedn API to update the chef's profile with the new data.
            const res = await fetch(`${API_URL}/ChefProfile`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`, //including authentication token to ensure that only authorized users can edit the profile.
                },
                body: formData,
            });

            if (!res.ok) {  //if the response is not successful, it attempst to parse the error message as raw text or json.
                const rawText = await res.text();
                let data: any = null;

                try {
                    data = rawText ? JSON.parse(rawText) : null;
                } catch {
                    data = rawText;
                }

                throw new Error((typeof data === "string" && data) || data?.message || "Failed to update chef profile");                
            }

            setSuccess("Chef profile updated successfully");
            setTimeout(() => setSuccess(""), 2000); //sets success masages and clears after 2 seconds.
            window.location.reload(); // reload the window to reflect the change or update.

        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred while updating the profile. Please try again.");
        } finally {
            setLoading(false);
        }
    }


    //this defines the profile image source, from absolute to relatve URL, if no profle, a default profile image is used instead.
    const profileImageSrc =
        chefProfile?.profileImageURL && typeof chefProfile.profileImageURL === "string"
            ? chefProfile.profileImageURL.startsWith("http")
                ? chefProfile.profileImageURL
                : `${new URL(API_URL).origin}${chefProfile.profileImageURL.startsWith("/") ? "" : "/"}${chefProfile.profileImageURL}`
            : DefaultProfile;

            //The JSX returns the create profile form, edit profile form and delete confirmation dialog as modals, and the main dashboard content which displays the chef's profile information and buttons to edit, delete or manage recipes.
    const createProfile = (
        <div>
             <form className="generalQuestions" onSubmit={onSubmit}>
                <label className = "question"> Professional Title
                    <input required type = "text" name="ProfessionalTitle" onChange={onChange} placeholder="e.g. Pastry Chef, Sous Chef, etc."/>
                </label>

                <label className = "question"> Bio
                    <textarea required rows = {5} name="Bio" onChange={onChange} placeholder="A short bio about you and your culinary journey"/>
                </label>                 

                <label className = "question"> Profile Picture
                    <input type = "file" accept="image/*" name="ProfileImageURL" onChange={onChange}/>
                </label>
                
                <label className = "question">Make profile public?
                    <input type = "checkbox" name="IsProfileVisible" checked={form.IsProfileVisible} onChange={e => setForm((prev) => ({...prev, IsProfileVisible: e.target.checked}))}/>
                </label> 

                <button className="post-discussion-button" type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Profile"}
                </button>
                {error && <p style={{ color: "crimson" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}

            </form>
        </div>
    )

    //JSX for edit profile form, prefilled with the chef's existing profile data allowing them to make changes and submit the updated profile information to the backend API.
    const editProfile = (
        <div>
             <form className="generalQuestions" onSubmit={(e) => { e.preventDefault(); onEditProfile(); }}>
                <label className = "question"> Professional Title
                    <input required type = "text" name="ProfessionalTitle" value={form.ProfessionalTitle} onChange={onChange} />
                </label>

                <label className = "question"> Bio
                    <textarea required rows = {5} name="Bio" value={form.Bio} onChange={onChange}/>
                </label>

                <label className = "question"> Profile Picture
                    <input type = "file" accept="image/*" name="ProfileImageURL" onChange={onChange}/>
                </label>

                <label className = "question">Make profile public?
                    <input type = "checkbox" name="IsProfileVisible" checked={form.IsProfileVisible} onChange={e => setForm((prev) => ({...prev, IsProfileVisible: e.target.checked}))}/>
                </label>
                <button className="post-discussion-button" type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Profile"}
                </button>
                {error && <p style={{ color: "crimson" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}
            </form>
        </div>
    )

    //this defines the delete confirmation dialog that appears when a chef attempsts to delete their profile.
    const deleteConfirm = (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem"}}>
            <p>Are you sure you want to delete your profile? This action cannot be undone.</p>
            <div style={{display: "flex", gap: "1rem"}}>
                <button style={{backgroundColor: "crimson", color: "white"}} onClick={async () => {
                    setLoading(true);
                    setError("");
                    setSuccess("");

                    try{
                        const token = getAuthToken();
                    if(!token){  //validating that only the logged in and authenticated user can delete their profile. If not authenticated, it sets an error message and redirects to the login page.
                        setError("User not authenticated. Please log in.");
                        return;
                    }
                    const res = await fetch(`${API_URL}/ChefProfile`, {  //sending the DELETE request to the backend API to delete the chef's profile.
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const data = await res.json().catch(() => null);
                    if (!res.ok) { //handling backend responses if delete fials.
                        setError(data?.message || "Failed to delete profile. Please try again.");
                        return;
                    }

                    setSuccess("Profile deleted successfully."); //page deletion confirmation.
                    setShowDeleteConfirm(false);
                    } catch (error) {
                        setError(error instanceof Error ? error.message : "An error occurred while deleting the profile. Please try again.");
                    }
                    finally{
                        setLoading(false);
                        setShowDeleteConfirm(false);
                        window.location.reload(); //it relods the page to reflect the change. which requires the chef to create a new profile to access the dashboard features again.
                    }
                }}>Yes, delete my profile</button>
                <button onClick={() => setShowDeleteConfirm(false)}>No, keep my profile</button>
            </div>
        </div>
    )

    return(
        <HomeLayout   /* //rendering the HomeLayout component and passing the topLayer and pageContent as props. The topLayer contains the heading of the dashboard with the chef's name and professional title, while the pageContent contains the main content of the dashboard, including the chef's profile information and buttons to edit, delete or manage recipes. */
            topLayer=
            {
            <div className="top_heading2" style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                <img src={RN_logo} alt="Recipe Nest Logo" width={32} height={32} />
                <h3>Your Dashboard | {chefProfile?.professionalTitle || ""} {chefName || "Chef"}</h3>
            </div>
            }
            pageContent=
            {
                <>
                    {loading && <p>Loading...</p>}
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {success && <p style={{ color: "green" }}>{success}</p>}


                    <div className="dashboard">
                    

                        {chefProfile ? ( /* //if the chef profile data is available, it displays the chef's profile information including their profile picture, professional title, bio and name. If no profile data is found, it prompts the chef to create a new profile by clicking on the "Create new Profile" button which opens the create profile modal. */
                            <div className="chef-profile">
                                <img
                                    src={profileImageSrc}
                                    alt={`${chefProfile.firstName} ${chefProfile.lastName}`}
                                    width={250}
                                    height={250}
                                    onError={(e) => {
                                        e.currentTarget.src = DefaultProfile;
                                    }}
                                    style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid var(--white)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                />
                                <h4>{chefProfile.professionalTitle ?? "Chef"} </h4>
                                <p style={{textAlign: "center"}}>{chefProfile.bio}</p>

                                <h2>{chefProfile.firstName} {chefProfile.lastName}</h2>
                            </div>
                        ) : ( /* //it displays a message prompting the chef to create a new profile and a button to open the create profile modal if no chef profile data is found. */
                            <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem"}}>
                                <p>No chef profile loaded yet. Please create a new profile by clicking on "Create new Profile" below.</p>
                                <button className="post-discussion-button" onClick={() =>
                                    setShowCreateProfile(true)
                                }>Create new Profile</button>

                                <Modal isOpen={showCreateProfile} onClose={() => setShowCreateProfile(false)}>
                                    {createProfile}
                                </Modal>
                            </div>
                        )}

                    {/* //if chef profile data is available, it displays buttons to edit, delete profiles and manage user recipes. The edit and delete buttons open their respective modals when clicked, allowing the chef to make changes to their profile or confirm profile deletion. */}
                        <div className="dashboard-buttons">
                            <button onClick={() => setShowEditProfile(true)}>Edit Profile</button>
                            <button onClick={() => setShowDeleteConfirm(true)}>Delete Profile</button>
                            <button onClick={() => navigate("/manage-recipes")}>Manage Recipes</button>
                        </div>

                        <Modal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)}>
                            {editProfile}
                        </Modal>

                        <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
                            {deleteConfirm}
                        </Modal>

                    </div>
                </>
            }
        >
        </HomeLayout>
    )
}