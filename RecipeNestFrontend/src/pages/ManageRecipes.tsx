import HomeLayout from "../components/HomeLayout";
import RN_logo from "../assets/RecipeNest.png";
import "./Home.css";
import {getAuthHeaders, getAuthToken} from "../utils/auth";
import CreateRecipe from "./CreateRecipe";
import {useState} from "react";
import Modal from "../components/modal/Modal";
import {useNavigate} from "react-router-dom";
import {Plus, Trash2, Eye} from "lucide-react";


//The ManageReciepes page allows users to create new recipes, delete all their recipes, and view their existing recipes.
//It uses the HomeLayout component for consistent styling and layout across the application.
//The page includes error handling and success messages for user feedback, as well as modals for confirming actions and creating new recipes.
export default function ManageRecipes() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  //the function handles the deletion of all recipes for the authenticated user. It sends a DELETE request to the API and provides feedback to the user based on the success or failure of the operation.
  async function onDeleteAll() {
    setError("");
    setLoading(true);
    setSuccess("");
    setShowDeleteModal(true);

    const token = getAuthToken();
    if (!token) {
      setError("You must be logged in to delete recipes.");
      setLoading(false);
      return;
    }

    //the function sends a DELETE request to the API endpoint for deleting recipes, including authentication headers to ensure that only authenticated users can perform this action. 
    // It handles the response and updates the UI accordingly, showing success or error messages and managing the loading state
    try{
      const res = await fetch(`${API_URL}/recipe`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(), //authentication headers are included in the request to ensure that only authenticated users can delete recipes.
        },
      });

      const data = await res.json().catch(() => null);
      if(!res.ok) {
        throw new Error(data?.message || "Failed to delete all recipes");
      }
      setSuccess("All recipes deleted successfully.");
    } catch (error: any) {
      setError(error.message || "An error occurred while deleting recipes.");
      window.setTimeout(() => {
        setSuccess("");
        setError("");
      }, 2000);
    } finally {
      setLoading(false);
      window.setTimeout(() => {
        setShowDeleteModal(false);
      }, 2000);
    }
  }

  //the page renders the HomeLayout component with a top layer containing a heading and an icon, and the main content area includes sections for creating a new recipe, deleting all recipes, and viewing existing recipes.
  //Each section has its own button that triggers the corresponding action or navigation when clicked. Modals are used for confirming deletion and creating new recipes, providing a user-friendly interface for managing recipes.
  return (
    <HomeLayout
      topLayer={
        <div className="top_heading2" style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
              <img src={RN_logo} alt="Recipe Nest Logo" width={32} height={32} />
              <h3>Manage Recipes</h3>
          </div>
      }
      pageContent={
        <div className="manage-recipes-wrapper">
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <div className="manageRecipe_container">
            <div className="manageRecipe_left">
              <div className="manageRecipe_icon">
                <Plus size={25} />
              </div>

              <div className="manageRecipe_text">
                <h3>Create a new recipe</h3>
                <p>Share a new recipe with the community.</p>
              </div>
            </div>

            <div className="manageRecipe_right">
              <button onClick={() => setShowCreateModal(true)}>
                Create recipe
              </button>
            </div>
          </div>

            <Modal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              hasCloseButton={true}
            >
              <CreateRecipe onSuccess={() => window.setTimeout(() => {
                setShowCreateModal(false);
              }, 2000)} />
            </Modal>

          <div className="manageRecipe_container">
            <div className="manageRecipe_left">
              <div className="manageRecipe_icon">
                <Trash2 size={25} />
              </div>

              <div className="manageRecipe_text">
                <h3>Delete all your recipes</h3>
                <p>Remove all your recipes from the community.</p>
              </div>
            </div>

            <div className="manageRecipe_right">
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={loading}
                style={{backgroundColor: "red", color: "white"}}
              >
                {loading ? "Deleting..." : "Delete all recipes"}
              </button>
            </div>
          </div>

          <Modal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              hasCloseButton={true}
            >
              <p>Are you sure you want to delete all recipes?</p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
                <button className="post-discussion-button" onClick={onDeleteAll} disabled={loading}>
                  {loading ? "Deleting..." : "Yes, delete all recipes"}
                </button>
                <button className="post-discussion-button" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>
            </Modal>


          <div className="manageRecipe_container">
            <div className="manageRecipe_left">
              <div className="manageRecipe_icon">
                <Eye size={25} />
              </div>

              <div className="manageRecipe_text">
                <h3>View all your recipes</h3>
                <p>Browse and manage your own recipes.</p>
              </div>
            </div>

            <div className="manageRecipe_right">
              <button onClick={() => navigate("/view-your-recipe")}>
                View your recipes
              </button>
            </div>
          </div>

        </div>
      }>

    </HomeLayout>
  )
}