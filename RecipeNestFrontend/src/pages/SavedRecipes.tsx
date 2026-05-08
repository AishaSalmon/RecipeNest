import HomeLayout from "../components/HomeLayout";
import RN_logo from "../assets/RecipeNest.png";
import "./Home.css";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SavedRecipeCard from "./SavedRecipeCard";
import Modal from "../components/modal/Modal";
import ViewRecipe from "./ViewRecipe";
import type { Recipe } from "../types/recipe";
import { buildRecipePlatformShareUrl, copyRecipeShareUrl } from "../utils/recipeShare";
import type { RecipeShareTarget } from "../utils/recipeShare";
import { getAuthHeaders, getAuthToken } from "../utils/auth";
import SearchSortControls from "../components/SearchSortControls";

//the normalizeIngredients and normalizeRecipe functions are helper functions to convert the raw data from the backend into a format that the frontend can work with. 
//They ensure that all necessary fields are populated, even if some data is missing from the source.
//This allows the frontend to work with a consistent data structure regardless of how the backend formats its responses.
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

function normalizeRecipe(source: any): Recipe {
    return {
        recipeId: source?.recipeId ?? source?.RecipeId ?? source?.id ?? source?.Id,
        recipeTitle: source?.recipeTitle ?? source?.RecipeTitle ?? "",
        recipeDescription: source?.recipeDescription ?? source?.RecipeDescription ?? "",
        cookingInstructions: source?.cookingInstructions ?? source?.CookingInstructions ?? "",
        recipeIngredients: normalizeIngredients(source),
        recipeImageURL: source?.recipeImageURL ?? source?.RecipeImageURL,
        createdAt: source?.createdAt ?? source?.CreatedAt,
        profileImageURL: source?.profileImageURL ?? source?.ProfileImageURL,
        firstName: source?.firstName ?? source?.FirstName,
        lastName: source?.lastName ?? source?.LastName,
        professionalTitle: source?.professionalTitle ?? source?.ProfessionalTitle,
    };
}


//the savedRecipes page helps to display the recipes that the logged in user has saved to his/her profile. It fetches the saved recipes from the backend API and displays them in a list.
//users can view, share, or delete the recipes from being saved, this triggers the Delete endpoint in the backend to remove the recipe from the user's saved recipes list.
//hte page also provides search and sorting functionality to help users find specific recipes within their saved collection.
//additionally, it handles loading states, error messages, and success notifications to provide feedback to the user throughout their interaction with the page.
export default function SavedRecipes() {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
    const [modalError, setModalError] = useState("");
    const [modalSuccess, setModalSuccess] = useState("");
    const [recipeQuery, setRecipeQuery] = useState("");
    const [recipeSort, setRecipeSort] = useState("newest");

    // The recipes can be searched and sorted based on different criteria.
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


    // always fetch the saved recipes when the component mounts.
    useEffect(() => {
        void fetchSavedRecipes();
    }, []);

    useEffect(() => { //resettting the error and success messages after 2 seconds whenever they change, to provide feedback to the user.
        if (!error && !success) {
            return;
        }

        const timer = window.setTimeout(() => {
            setError("");
            setSuccess("");
        }, 2000);

        return () => clearTimeout(timer);
    }, [error, success]);


    //this function handles the fetching of the saved recipes from the backend API. It checks if the user is authenticated, and if so, it makes a GET request to retrieve the saved recipes. 
    //the response is then normalized and stored in the component's state. If there's an error during the fetch, it returns a pre-configured error message feedback to the user.
    async function fetchSavedRecipes() {
        setLoading(true);
        setError("");
        setSuccess("");

        if (!getAuthToken()) {
            setLoading(false);
            setError("Please login to view saved recipes.");
            navigate("/login");
            return;
        }

        try { //the API returns to saved recipes from the savedREcipe endpoint. The variance in the response structure is handled by checkign multiple possible field names to extract the recipes array.
            const res = await fetch(`${API_URL}/savedRecipe`, {
                method: "GET",
                headers: {
                    ...getAuthHeaders(),  //authentication headers are included in the request to ensure that only the saved recipes of the logged-in user are fetched.
                },
            });

            const data = await res.json().catch(() => null); //catching if the response is not a valid JSON, to prevent the app from crashing and instead show a user-friendly error message.

            if (!res.ok) { //handles error responses fromt the backend.
                throw new Error(data?.message || "Unable to load saved recipes.");
            }

            const rawRecipes = Array.isArray(data)
                ? data
                : Array.isArray(data?.recipes)
                    ? data.recipes
                    : Array.isArray(data?.savedRecipes)
                        ? data.savedRecipes
                        : Array.isArray(data?.data)
                            ? data.data
                            : [];

            const mappedRecipes = rawRecipes.map((recipe: any) => normalizeRecipe(recipe));
            setRecipes(mappedRecipes);
        } catch (err) {
            setRecipes([]);
            setError(err instanceof Error ? err.message : "Unable to load saved recipes.");
        } finally {
            setLoading(false);
        }
    }

    //the onShareRecipe function is responsible for copying the share URL of a recipe to the clipboard or redirecting to the appropriate platform. It also provides feedback to users about the success or failure of their share action.
    async function onShareRecipe(recipeId: number) {
        try {
            await copyRecipeShareUrl(recipeId);
            setModalSuccess("Recipe URL copied to clipboard.");
            setModalError("");
            window.setTimeout(() => setIsShareModalOpen(false), 600);
        } catch {
            setModalError("Failed to copy recipe URL.");
        }
    }

    //the onSharePlatform function builds the share URL for the specified platform and opens it in a new tab, allowing users to share the recipe directly on their chosen platform.
    function onSharePlatform(recipeId: number, target: RecipeShareTarget) {
        const shareUrl = buildRecipePlatformShareUrl(recipeId, target);
        window.open(shareUrl, "_blank");
        setIsShareModalOpen(false);
    }


    //the onDelete function handles the removal of a saved recipe form a user's saved recipe profile.
    async function onDelete(recipeId: number) {
        setError("");
        setSuccess("");
        setLoading(true);

        //to remove the saved recipe, a DELETE request is sent to the backend API with the recipeId.
        try {
            const res = await fetch(`${API_URL}/savedRecipe/${recipeId}`, {
                method: "DELETE",
                headers: {
                    ...getAuthHeaders(),  //authentication headers are included to ensure that only the owner of the saved recipe can delete it.
                },
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "Unable to delete saved recipe.");
            }

            setSuccess("Recipe deleted successfully."); //success feedback is provided to the user upon successful deletion of the saved recipe.
            setRecipes((prev) => prev.filter((recipe) => recipe.recipeId !== recipeId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to delete saved recipe.");
        } finally {
            setLoading(false);
        }
    }


    //the return statement renders the JSX components for the saved recipes page, including the layout, search and sort controls, recipe cards, and modals for viewing and sharing recipes.
    //it also conditionally displays loading indicators, error messages, and success notifications based on the component's state.
    return (
        <HomeLayout
            topLayer={
                <div className="top_heading2" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <img src={RN_logo} alt="Recipe Nest Logo" width={32} height={32} />
                    <h3>Saved Recipes</h3>
                </div>
            }
            pageContent={
                <>
                    {loading && <p>Loading saved recipes...</p>}
                    {error && <p style={{ color: "crimson" }}>{error}</p>}
                    {success && <p style={{ color: "green" }}>{success}</p>}
                    <SearchSortControls
                        query={recipeQuery}
                        onQueryChange={setRecipeQuery}
                        sortValue={recipeSort}
                        onSortChange={setRecipeSort}
                        searchPlaceholder="Search saved recipes by title, description, or chef..."
                        sortOptions={[
                            { value: "newest", label: "Newest" },
                            { value: "oldest", label: "Oldest" },
                            { value: "title-asc", label: "Title A-Z" },
                            { value: "title-desc", label: "Title Z-A" },
                        ]}
                    />

                    {!loading && !error && filteredSortedRecipes.length === 0 && <p>No saved recipes found for your search.</p>}

                    {filteredSortedRecipes.map((recipe) => (
                        <SavedRecipeCard
                            key={recipe.recipeId}
                            recipe={recipe}
                            onDelete={() => {
                                onDelete(recipe.recipeId);
                            }}
                            onView={() => {
                                setSelectedRecipe(recipe);
                                setIsViewModalOpen(true);
                            }}
                            onShare={(recipeId) => {
                                setSelectedRecipeId(recipeId);
                                setModalError("");
                                setModalSuccess("");
                                setIsShareModalOpen(true);
                            }}
                        />
                    ))}

                    {/* //the view modal displays the details of a selected saved recipe along with feedback messages to user. */}
                    <Modal
                        isOpen={isViewModalOpen}
                        hasCloseButton={true}
                        onClose={() => {
                            setIsViewModalOpen(false);
                            setSelectedRecipe(null);
                        }}
                    >
                        {selectedRecipe ? <ViewRecipe recipe={selectedRecipe} /> : <p>No recipe selected.</p>}
                    </Modal>

                    {/* //the share modal provides options for sharing the selected recipe on various platforms or copying the share URL to the clipboard, along with feedback messages for the user. */}
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
                </>
            }
        ></HomeLayout>
    );
}
