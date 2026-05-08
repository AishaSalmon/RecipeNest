import HomeLayout from "../components/HomeLayout";
import RN_logo from "../assets/RecipeNest.png";
import "./Home.css";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecipeCard from "./RecipeCard";
import Modal from "../components/modal/Modal";
import ViewRecipe from "./ViewRecipe";
import type { Recipe } from "../types/recipe";
import { buildRecipePlatformShareUrl, copyRecipeShareUrl } from "../utils/recipeShare";
import type { RecipeShareTarget } from "../utils/recipeShare";
import { getAuthHeaders, getAuthToken } from "../utils/auth";
import SearchSortControls from "../components/SearchSortControls";

//the ChefRecipes page is responsible for displaying a chef's profile information along with their recipes.
// It fetches the chef's data and recipes from the backend API using the chefId obtained from the route parameters.
// The page also provides functionality to view recipe details in a modal, share recipes on various platforms, and save recipes to the user's profile.
// The component handles loading states, error messages, and success notifications to provide feedback to the user throughout their interaction with the page.
type ChefProfileWithRecipes = { //the ChefProfileWithRecipes type defines the structure of the chef's profile and their associated recipes.
    chefProfileId: number;
    profileImageURL?: string;
    firstName?: string;
    lastName?: string;
    professionalTitle?: string;
    recipes?: any[];
    Recipes?: any[];
};

function normalizeIngredients(source: any): Recipe["recipeIngredients"] { //this is a function helper to convert the raw ingredeints data from the backend into a format that the frontend can work on and corresponds to the RecipeIngredeint type.
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

function normalizeRecipe(source: any, chef?: ChefProfileWithRecipes | null): Recipe { //the normalizeRecipe function takes the raw recipe data from the backend and the chef's profile information, and it constructs a Recipe object that the frontend can use. It ensures that all necessary fields are access from the backend, providing fallbacks and default values.
    return {
        recipeId: source?.recipeId ?? source?.RecipeId ?? source?.id ?? source?.Id,
        recipeTitle: source?.recipeTitle ?? source?.RecipeTitle ?? "",
        recipeDescription: source?.recipeDescription ?? source?.RecipeDescription ?? "",
        cookingInstructions: source?.cookingInstructions ?? source?.CookingInstructions ?? "",
        recipeIngredients: normalizeIngredients(source),
        recipeImageURL: source?.recipeImageURL ?? source?.RecipeImageURL,
        createdAt: source?.createdAt ?? source?.CreatedAt,
        profileImageURL:
            source?.profileImageURL ??
            source?.ProfileImageURL ??
            chef?.profileImageURL,
        firstName: source?.firstName ?? source?.FirstName ?? chef?.firstName,
        lastName: source?.lastName ?? source?.LastName ?? chef?.lastName,
        professionalTitle: source?.professionalTitle ?? source?.ProfessionalTitle ?? chef?.professionalTitle,
    };
}

//This is the main component for the ChefRecipes page. It manages the state of the chef's profile and their recipes, including handling the appopriate error.
// It also provides the UI for displaying the chef's recipes, searching and sorting them, and interacting with individual recipes through modals for viewing details, sharing, and saving.
//In this function, it handles fetching for the chef's profile, their recipes, options to save, search, share, sort and fileter the recipes. It also manages the state for loading, errors, and success messages to provide feedback to the user.
export default function ChefRecipes() {
    //creating the necessary states for the component to manage the chef's profile, ether recipes and error and success states and messages.
    const API_URL = import.meta.env.VITE_API_URL; //the Base API url allwoing to access the backend endpoints, it is stored in an environment variable for flexibility and security.
    const { chefId } = useParams<{ chefId: string }>();
    const navigate = useNavigate(); //to navigate between different routes int he application.

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [chef, setChef] = useState<ChefProfileWithRecipes | null>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
    const [modalError, setModalError] = useState("");
    const [modalSuccess, setModalSuccess] = useState("");
    const [modalLoading, setModalLoading] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [recipeQuery, setRecipeQuery] = useState("");
    const [recipeSort, setRecipeSort] = useState("newest");

    // The recipes can be searched and sorted based on different criteria.
    const filteredSortedRecipes = useMemo(() => { //the memoized value of the filtered and sorted recipes is calculated based on the original list of recipes, the search query, and the selected sort option. This ensures that the filtering and sorting logic is only re-executed when one of these dependencies changes, improving performance.
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

        const sorted = [...filtered]; //it creates a shallow copy of the filterd recipes array to avoid mutating the original state when sorting.
        sorted.sort((a, b) => {
            if (recipeSort === "title-asc") {
                return a.recipeTitle.localeCompare(b.recipeTitle);
            }
            if (recipeSort === "title-desc") {
                return b.recipeTitle.localeCompare(a.recipeTitle);
            }

            const aTime = new Date(a.createdAt ?? 0).getTime(); //convert the createdAt date to a timestamp for comparison. It creats two timestamps, for recipes a and b and compages them to set the olderst and newest order
            const bTime = new Date(b.createdAt ?? 0).getTime();
            return recipeSort === "oldest" ? aTime - bTime : bTime - aTime;
        });

        return sorted;
    }, [recipes, recipeQuery, recipeSort]);

    //the component fetches the chef's profile and their recipes when it mounts or when the chefId changes.
    useEffect(() => {
        void fetchChefAndRecipes();
    }, [chefId]);

    useEffect(() => { //this effect is used to clear error and success messages after 2 seconds, providing feedback to the user without cluttering the UI.
        const timer = setTimeout(() => {
            setError("");
            setSuccess("");
        }, 2000);

        return () => clearTimeout(timer);
    }, [error, success]);


    //the function fetches the chef and their recipes from the backend.
    async function fetchChefAndRecipes() {
        if (!chefId) { //ensuring that a chefId is present in the route parameters before attempting to fetch. (ensure login or correct route)
            setError("No chef id found in route.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const endpointCandidates = [`${API_URL}/ChefProfile/${chefId}`, `${API_URL}/chef/${chefId}`]; //testing different endpoints 
            let data: any = null;
            let responseFound = false;

            for (const endpoint of endpointCandidates) {
                const res = await fetch(endpoint, { method: "GET" });

                if (!res.ok) {
                    continue;
                }

                const text = await res.text(); //gettign the response as text to ensure consistent formating, then trying to parse it as JSON.
                try {
                    data = text ? JSON.parse(text) : null;
                } catch {
                    data = null;
                }
                responseFound = true;
                break;
            }

            if (!responseFound || !data) { //if no valid response is gotten from the backend, a default error message is set.
                throw new Error("Unable to load chef profile and recipes.");
            }

            const mappedChef: ChefProfileWithRecipes = {  //mapping backedn response data to chefprofilewith recipes type, provideing fallbacks
                chefProfileId: data.chefProfileId ?? data.ChefProfileId ?? Number(chefId),
                profileImageURL:
                    data.profileImageURL ??
                    data.ProfileImageURL ??
                    data.chefProfileImageURL ??
                    data.ChefProfileImageURL,
                firstName: data.firstName ?? data.FirstName,
                lastName: data.lastName ?? data.LastName,
                professionalTitle: data.professionalTitle ?? data.ProfessionalTitle,
                recipes: data.recipes ?? data.Recipes ?? [],
            };

            const rawRecipes = Array.isArray(mappedChef.recipes) ? mappedChef.recipes : [];
            const mappedRecipes = rawRecipes.map((recipe: any) => normalizeRecipe(recipe, mappedChef));

            setChef(mappedChef);
            setRecipes(mappedRecipes);
            setSuccess("Chef recipes loaded successfully.");
        } catch (err) {
            setChef(null);
            setRecipes([]);
            setError(err instanceof Error ? err.message : "Unable to load chef recipes."); //handling errors during the fetch process
        } finally {
            setLoading(false);
        }
    }

    function openSaveModal(recipeId: number) { //this function is called when the user attempts to save a recipe. It sets the recipeId as passed by the selected recipe.
        setSelectedRecipeId(recipeId);
        setModalError(""); //clears modal error
        setModalSuccess("");//clears modal success
        setIsSaveModalOpen(true);
    }

    //this function handles the logic for saving a recipe to the user's profile.
    //it checks that the user is logged in and a recipe has been selected.
    async function onSaveRecipe() {
        if (!selectedRecipeId) {
            setModalError("No recipe selected.");
            return;
        }

        setModalError("");
        setModalSuccess("");
        setModalLoading(true);

        if (!getAuthToken()) {
            setModalError("Please login to save this recipe.");
            setModalLoading(false);
            navigate("/login");
            return;
        }

        try {  //sending a post request to the backend, to create a new saved recipe entry for the logged in user and selected recipe.
            const res = await fetch(`${API_URL}/savedRecipe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", //specifying that the request is in JSOn format.
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({ RecipeId: selectedRecipeId }), 
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "You have already saved this recipe."); //catching errors.
            }

            setModalSuccess("Recipe saved successfully.");
            window.setTimeout(() => {
                setIsSaveModalOpen(false);
                setSuccess("Recipe saved successfully.");
            }, 800);
        } catch (err) {
            setModalError(err instanceof Error ? err.message : "Unexpected error"); //handling errors during the save process
        } finally {
            setModalLoading(false);
        }
    }


    //this function handles the logic for sharing a recipe by copying its URL to the clipboard. It provides feedback on success or failure of the copy action.
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

    //this function handles the logic for sharing a recipe on a specific platform by opening a new window with the platform's share URL.
    function onSharePlatform(recipeId: number, target: RecipeShareTarget) {
        const shareUrl = buildRecipePlatformShareUrl(recipeId, target);
        window.open(shareUrl, "_blank");
        setIsShareModalOpen(false);
    }

    //the compnent render the chef's recipes along with search and sort controls, and modals for viewing recipe details, sharing, and saving recipes.
    //It also displays loading states, error messages, and success notifications to provide feedback to the user.
    return (
        <HomeLayout
            topLayer={
                <div className="top_heading2" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <img src={RN_logo} alt="Recipe Nest Logo" width={32} height={32} />
                    <h3>
                        Chef Recipes
                        {chef ? ` | ${chef.firstName ?? ""} ${chef.lastName ?? ""}`.trim() : ""}
                    </h3>
                </div>
            }
            pageContent={ /* //the page conent. */
                <>
                    {/* //if content is loading, a loading message is displayed. */}
                    {loading && <p>Loading chef recipes...</p>}
                    {/* //if there's an error, it is displayed in red. */}
                    {error && <p style={{ color: "crimson" }}>{error}</p>}
                    {/* //if there's a success message, it is displayed in green. */}
                    {success && <p style={{ color: "green" }}>{success}</p>}
                    <SearchSortControls /* //the sorting functionality defines the search and sort controls. */
                        query={recipeQuery}
                        onQueryChange={setRecipeQuery}
                        sortValue={recipeSort}
                        onSortChange={setRecipeSort}
                        searchPlaceholder="Search chef recipes by title or description..."
                        sortOptions={[
                            { value: "newest", label: "Newest" },
                            { value: "oldest", label: "Oldest" },
                            { value: "title-asc", label: "Title A-Z" },
                            { value: "title-desc", label: "Title Z-A" },
                        ]}
                    />

                    {/* //displaying a message if no recipes are found after filtering and searching. */}
                    {!loading && !error && filteredSortedRecipes.length === 0 && <p>No recipes found for your search.</p>}

                    {filteredSortedRecipes.map((recipe) => (
                        <RecipeCard  /* //the sorting functionality maps the filtered and sorted recipes into the recipescard component, pasisng the appropriate props for each recipe. */
                            key={recipe.recipeId}
                            recipe={recipe}
                            onSave={openSaveModal}
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

                    <Modal  /* //a modal is used to display the details of a selected recipes, when the user clicks a button to view it. The modal can be closed to return to the list of recipes. */
                        isOpen={isViewModalOpen}
                        hasCloseButton={true}
                        onClose={() => {
                            setIsViewModalOpen(false);
                            setSelectedRecipe(null);
                        }}
                    >
                        {selectedRecipe ? <ViewRecipe recipe={selectedRecipe} /> : <p>No recipe selected.</p>} {/* //the content of the modal is the viewrecipe component, which displays the details of the selected recipe. If no recipe is selected, a message is shown instead. */}
                    </Modal>

                    <Modal  /* // a modal is used to provide sharing options for a selected recipe, allowing the user to share the recipe on various platforms or copy its link. Depending on the platform, clicking their buttons navigate to their pages. The modal also handles feedback for sharing actions. */
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


                            <Modal  /* //a modal is used to confirm saving a recipe to the user's profile. When saved, it can be viewed and retried to a list in the user profile. */
                        isOpen={isSaveModalOpen}
                        hasCloseButton={true}
                        onClose={() => setIsSaveModalOpen(false)}
                    >
                        <h2>Save Recipe</h2>
                        <p>Are you sure you want to save this recipe to your profile?</p>
                        <button className="post-discussion-button" onClick={onSaveRecipe} disabled={modalLoading}>
                            {modalLoading ? "Saving..." : "Yes, Save it!"}
                        </button>
                        {modalError && <p style={{ color: "crimson" }}>{modalError}</p>}
                        {modalSuccess && <p style={{ color: "green" }}>{modalSuccess}</p>}
                    </Modal>

                </>
            }
        ></HomeLayout>
    );
}
