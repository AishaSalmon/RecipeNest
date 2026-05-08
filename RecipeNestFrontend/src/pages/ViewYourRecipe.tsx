import HomeLayout from "../components/HomeLayout";
import RN_logo from "../assets/RecipeNest.png";
import "./Home.css";
import {getAuthHeaders, getAuthToken} from "../utils/auth";
import {useEffect, useState, useMemo} from "react";
import type { Recipe } from "../types/recipe";
import ViewYourRecipeCard from "./ViewYourRecipeCard";
import Modal from "../components/modal/Modal";
import ViewRecipe from "./ViewRecipe";
import { useNavigate } from "react-router-dom";
import EditRecipe from "./EditRecipe";
import { buildRecipePlatformShareUrl, copyRecipeShareUrl } from "../utils/recipeShare";
import type { RecipeShareTarget } from "../utils/recipeShare";
import SearchSortControls from "../components/SearchSortControls";


//normalizing the ingredients data from the backend to match the RecipeIngredient type used in the frontend to hanlde the difference in naming conventions and data structures between the backend and frontend.
function normalizeIngredients(source: any): Recipe["recipeIngredients"] {
    const rawIngredients = source?.recipeIngredients ?? source?.RecipeIngredients ?? [];

    if (!Array.isArray(rawIngredients)) {
        return [];
    }

    return rawIngredients.map((ingredient: any) => ({
        ingredientName: ingredient?.ingredientName ?? ingredient?.IngredientName ?? "",
        ingredientQuantity: Number(ingredient?.ingredientQuantity ?? ingredient?.IngredientQuantity ?? 0),
        unitOfMeasurement: ingredient?.unitOfMeasurement ?? ingredient?.UnitOfMeasurement ?? "",
    }));
}


//ViewYourRecipe page is responsible for displaying the list of recipes created by the loogged in user, when they click on the "View Your Recipes" button from the manage recipe page.
// It fetches the user's recipes from the backend API and displays them in a list of recipe cards.
export default function ViewYourRecipe(){
    const API_URL = import.meta.env.VITE_API_URL;
    const token = getAuthToken();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [error, setError] = useState(""); 
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [modalError, setModalError] = useState("");
    const [modalSuccess, setModalSuccess] = useState("");
    const [modalLoading, setModalLoading] = useState(false);
    const navigate = useNavigate();
    const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
    const [recipeQuery, setRecipeQuery] = useState("");
    const [recipeSort, setRecipeSort] = useState("newest");

    //handling the filtering and sorting of the recipes based on the user's input in the search and sort controls.
    //the recipes can be searched by title, description, chef's name and professional title.
    //it can also be sroted by newest, oldest, title A-Z and title Z-A.
    const filteredSortedRecipes = useMemo(() => {
        const q = recipeQuery.trim().toLowerCase();
        const filtered = recipes.filter((recipe) => {
            if (!q) {
                return true;
            }

            const haystack = [
                recipe.recipeTitle,
                recipe.recipeDescription,
                recipe.firstName,
                recipe.lastName,
                recipe.professionalTitle,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(q);
        });

        const sorted = [...filtered];
        sorted.sort((a, b) => {
            if (recipeSort === "title-asc") {
                return a.recipeTitle.localeCompare(b.recipeTitle);
            }
            if (recipeSort === "title-desc") {
                return b.recipeTitle.localeCompare(a.recipeTitle);
            }

            const aTime = new Date(a.createdAt ?? 0).getTime();
            const bTime = new Date(b.createdAt ?? 0).getTime();
            return recipeSort === "oldest" ? aTime - bTime : bTime - aTime;
        });

        return sorted;
    }, [recipes, recipeQuery, recipeSort]);

   //the useEffect hook is used to fetch the user's recipes from the backend API when the component mounts. It also handles the loading state, error messages, and success notifications based on the API response.
    useEffect(() => {
        fetchAllRecipes();
    }, []);

    useEffect(() => {
        if (error) { //for clearing the error messages after 2 seconds.
            const timer = window.setTimeout(() => setError(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (success) { //for clearing the success messages after 2 seconds.
            const timer = window.setTimeout(() => setSuccess(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [success]);
    
    //function to fetch all recipes of the user from the backend API. it checks if the user is authenticated by verifying the presence of a token from the localstorage.
    async function fetchAllRecipes() {
        if (!token) {
        setError("You must be logged in to view your recipes.");
        return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        //the function makes a GET request to the /recipe endpoint of the backend API to retrieve the user's recipes.
        try{
            const res = await fetch(`${API_URL}/recipe`, {
                method: "GET",
                headers: {
                    ...getAuthHeaders(), //to authnticate the request using the token from localstorage.
                },
            });
            const data = await res.json().catch(() => null);

            if (res.status === 404) {  //if API returns a not found error, it means that the user has not created a recipe yet, so it returns an empty list of recipes and an error message is displayed to the user.
                setRecipes([]);
                setError("No recipes found. Start by creating your first recipe!");
                return;
            }
            if(!res.ok){
                throw new Error(data?.message || "Unable to fetch your recipes");
            }

            //mapping the raw backend recipe data to the frontend REcipe type. It also handles the case where the API might return a single object instead of an array, by checking if the data is an array and normalizing it accordingly.
            const recipeList: Recipe[] = Array.isArray(data)
            ? data.map((recipe: any) => ({
                recipeId: recipe.recipeId ?? recipe.RecipeId,
                recipeTitle: recipe.recipeTitle ?? recipe.RecipeTitle,
                recipeDescription: recipe.recipeDescription ?? recipe.RecipeDescription,
                cookingInstructions: recipe.cookingInstructions ?? recipe.CookingInstructions,
                recipeIngredients: normalizeIngredients(recipe),
                recipeImageURL: recipe.recipeImageURL ?? recipe.RecipeImageURL,
                createdAt: recipe.createdAt ?? recipe.CreatedAt,
                profileImageURL: recipe.profileImageURL ?? recipe.ProfileImageURL,
                firstName: recipe.firstName ?? recipe.FirstName,
                lastName: recipe.lastName ?? recipe.LastName,
                professionalTitle: recipe.professionalTitle ?? recipe.ProfessionalTitle,
            }))
            : [];
        setRecipes(recipeList);
        setSuccess("Recipes fetched successfully."); //it returns a success message if the recipes are fetched successfully from the backend API.
        } 
        catch (error: any) {
            setError(error.message || "An error occurred while fetching your recipes.");
        } 
        finally {
            setLoading(false);
        }
    }


    //the function handles the logic for viewing a recipe in detail when the user clicks on a recipeCard. It fetches the detail information of the selected recipe from teh backend API using the recipeId.
    async function onViewRecipe(selectedCard: Recipe) {
        setModalError("");
        setModalSuccess("");
        setModalLoading(true);
        setSelectedRecipe(selectedCard);
        setIsViewModalOpen(true);

        try {
            const recipeId = selectedCard.recipeId;
            if (!recipeId) {
                throw new Error("No recipe id found.");
            }

            const token = getAuthToken();
            if (!token) { //displaying an error message and redirecting the user to the login page if they are not authenticated when trying to view a recipe.
                setError("Please login to view this recipe");
                navigate("/login");
                return;
            }

            //the function makes a GET request to the recipe endpoint of the bakcend API.
            const res = await fetch(`${API_URL}/recipe/${recipeId}`, {
                method: "GET",
                headers: {
                    ...getAuthHeaders(),  //authenticating the request using the token from localstorage.
                },
            });

            if (!res.ok) {  //if the request is sucessful, it normalizes the recipe data and sets it to the selectedRecipe state to be displayed in the view modal. If the request fails, it displays an error message in the modal.
                setSelectedRecipe(selectedCard);
                setModalSuccess("Detailed recipe endpoint returned 404. Showing recipe from feed data.");
                return;
            }

            const data = await res.json().catch(() => null);
            if (!data) {        //if the response data is empty, it shows a message in the modal and displays the recipe data from the feed as a fallback to ensure that the user can still see the recipe details even if the detailed endpoint fails.
                setSelectedRecipe(selectedCard);
                setModalSuccess("Detailed recipe endpoint returned 404. Showing recipe from feed data.");
                return;
            }

            //normalizing the recipe data from the backend API to match the recipe type used in the frontend.
            const recipeDetail: Recipe = {
                recipeId: data.recipeId ?? data.RecipeId ?? data.id ?? data.Id,
                recipeTitle: data.recipeTitle ?? data.RecipeTitle,
                recipeDescription: data.recipeDescription ?? data.RecipeDescription,
                cookingInstructions: data.cookingInstructions ?? data.CookingInstructions,
                recipeIngredients: normalizeIngredients(data),
                recipeImageURL: data.recipeImageURL ?? data.RecipeImageURL,
                createdAt: data.createdAt ?? data.CreatedAt,
                profileImageURL: data.profileImageURL ?? data.ProfileImageURL,
                firstName: data.firstName ?? data.FirstName,
                lastName: data.lastName ?? data.LastName,
                professionalTitle: data.professionalTitle ?? data.ProfessionalTitle,
            };

            setSelectedRecipe(recipeDetail);
        } catch (e) {
            console.error(e);
            setSelectedRecipe(null);
            setModalError(e instanceof Error ? e.message : "An error occured. Please try again");
        } finally {
            setModalLoading(false);
        }
    }

    //the function handles the logic for deleting a recipe only by the owner of the recipe.
    //It makes a DELETE request to the backend API using the recipeId and updates the list of recipes in the frontend upon successful deletion.
    // It also handles loading states and error/success messages during the deletion process.
    async function onDeleteRecipe(recipeId: number) {
        setModalError("");
        setModalSuccess("");
        setModalLoading(true);
        setError("");
        setSuccess("");
        setIsDeleteModalOpen(true);

        const token = getAuthToken();
        if (!token) {
            setError("Please login to delete this recipe.");
            navigate("/login");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/recipe/${recipeId}`, {
                method: "DELETE",
                headers: {
                    ...getAuthHeaders(),
                },
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(data?.message || "Unable to delete recipe.");
            }

            setRecipes((prev) => prev.filter((recipe) => recipe.recipeId !== recipeId));
            setSuccess("Recipe deleted successfully.");
            window.setTimeout(() => {
                setSuccess("");
            }, 2000);
            if (selectedRecipe?.recipeId === recipeId) {
                setIsViewModalOpen(false);
                setSelectedRecipe(null);
            }
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "Unable to delete recipe.");
        }finally{
            setModalLoading(false);
            setIsDeleteModalOpen(false);
        }
    }

    //the function handles the logic for opening the share modal when the suer clicks on the share button on a recipe card.
    //It sets the selected recipe id to the state and opens the share modal for a user to choose the platform they want to share the recipe or copy the recipe link.
    async function openShareModal(recipeId: number) {
        setSelectedRecipeId(recipeId);
        setModalError("");
        setModalSuccess("");
        setIsShareModalOpen(true);
    }


    async function onShareRecipe(recipeId: number) {
        try {
            await copyRecipeShareUrl(recipeId);
            alert("Recipe URL copied to clipboard!");
            setIsShareModalOpen(false);
        } catch {
            alert("Failed to copy URL. Please try again.");
        }
    }

    //the function calls the buildRecipePlatformShareUrl utility function to generate the appropriate share URL for the selected platform and opens it in a new window.
    function onSharePlatform(recipeId: number, target: RecipeShareTarget) {
        const shareUrl = buildRecipePlatformShareUrl(recipeId, target);
        window.open(shareUrl, "_blank");
        setIsShareModalOpen(false);
    }

    //the return statement renders the ViewYourRecipe page, using the Home layout. It's content is displayed in teh page content, while the header of the page contains the Recipe Nest logo and the title "Your Recipes".
    //The page content includes the search and sort controls, the list of recipe cards, and the modals for viewing, sharing, editing and deleting recipes.
    //It also handles the display of loading states, error messages and success notifications based on the user's interactions and API responses.
    return ( 
        <HomeLayout
            topLayer={
                <div className="top_heading2" style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                    <img src={RN_logo} alt="Recipe Nest Logo" width={32} height={32} />
                    <h3>Your Recipes</h3>
                </div>
            }
            pageContent={
                <>
                {loading && <p>Loading your recipes...</p>}
                {error && <p style={{ color: "crimson" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}
                <SearchSortControls
                    query={recipeQuery}
                    onQueryChange={setRecipeQuery}
                    sortValue={recipeSort}
                    onSortChange={setRecipeSort}
                    searchPlaceholder="Search your recipes by title, description, or chef..."
                    sortOptions={[
                        { value: "newest", label: "Newest" },
                        { value: "oldest", label: "Oldest" },
                        { value: "title-asc", label: "Title A-Z" },
                        { value: "title-desc", label: "Title Z-A" },
                    ]}
                />
                {!loading && !error && filteredSortedRecipes.length === 0 && <p>No recipes found for your search.</p>}
                {!loading && filteredSortedRecipes.length > 0 && (
                    filteredSortedRecipes.map((recipe) => (
                        <ViewYourRecipeCard
                            key={recipe.recipeId}
                            recipe={recipe}
                            onView  = {() => onViewRecipe(recipe)}
                            onEdit = {() => {
                                setSelectedRecipe(recipe);
                                setIsEditModalOpen(true);
                            }}
                            onDelete = {() => {
                                setSelectedRecipeId(recipe.recipeId);
                                setIsDeleteModalOpen(true);
                            }}
                            onShare = {() => openShareModal(recipe.recipeId)}
                        />
                    ))
                )}


                {/* //the modal component for managing the sharing of recipes. */}
                <Modal
                    isOpen={isShareModalOpen}
                    hasCloseButton={true}
                    onClose={() => setIsShareModalOpen(false)}
                >
                    <h2>Share Recipe</h2>
                    <p>Choose how you want to share this recipe.</p>
                    <div className="actions">
                        <button onClick={() => selectedRecipeId && onSharePlatform(selectedRecipeId, "whatsapp")}>WhatsApp</button>
                        <button onClick={() => selectedRecipeId && onSharePlatform(selectedRecipeId, "email")}>Email</button>
                        <button onClick={() => selectedRecipeId && onSharePlatform(selectedRecipeId, "facebook")}>Facebook</button>
                        <button onClick={() => selectedRecipeId && onSharePlatform(selectedRecipeId, "twitter")}>Twitter</button>
                        <button onClick={() => selectedRecipeId && onShareRecipe(selectedRecipeId)}>Copy Link</button>
                    </div>
                    {modalError && <p style={{ color: "crimson" }}>{modalError}</p>}
                    {modalSuccess && <p style={{ color: "green" }}>{modalSuccess}</p>}
                </Modal>


                {/* //the modal handles the viewing of recipe details when a user clicks on the button on a recipe card. */}
                <Modal
                    isOpen={isViewModalOpen}
                    hasCloseButton={true}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedRecipe(null);
                    }}
                >
                    {modalLoading && <p>Loading recipe...</p>}
                    {!modalLoading && selectedRecipe && (
                        <ViewRecipe
                            recipe={selectedRecipe}
                            loading={modalLoading}
                            error={modalError}
                            success={modalSuccess}
                        />
                    )}
                    {!modalLoading && !selectedRecipe && modalError && (
                        <p style={{ color: "crimson" }}>{modalError}</p>
                    )}
                </Modal>


                {/* //the modal handles the confirmation of recipe deletion when a user clicks on the delete button on a recipe card. */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    hasCloseButton={true}
                    onClose={() => setIsDeleteModalOpen(false)}>
                        <h2>Delete Recipe</h2> 
                        <p>Are you sure you want to delete this recipe from your profile?</p>
                        <button className="post-discussion-button" onClick={() => selectedRecipeId && onDeleteRecipe(selectedRecipeId)} disabled={modalLoading}>
                            {modalLoading ? "Deleting..." : "Yes, Delete it!"}
                        </button>
                        {modalError && <p style={{ color: "crimson" }}>{modalError}</p>}
                        {modalSuccess && <p style={{ color: "green" }}>{modalSuccess}</p>}
                </Modal>

                {/* //the modal handles the editing of a recipe when a user clicks on the edit button on a recipe card. 
                    It renders the EditRecipe component inside the modal, passing the selected recipe as a prop for editing. Upon successful edit, it refreshes the list of recipes to reflect the changes. */}
                <Modal
                    isOpen={isEditModalOpen}
                    hasCloseButton={true}
                    onClose={() => setIsEditModalOpen(false)}>
                        <EditRecipe recipe={selectedRecipe} onSuccess={() => {
                            setIsEditModalOpen(false);
                            fetchAllRecipes();
                        }} />
                </Modal>

                </>
            }>
    </HomeLayout>
  );
}