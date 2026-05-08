import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HomeLayout from "../components/HomeLayout";
import { getAuthHeaders, getAuthToken } from "../utils/auth";
import Modal from "../components/modal/Modal";
import ViewRecipe from "./ViewRecipe";
import type { Recipe } from "../types/recipe";
import RecipeCard from "./RecipeCard";
import type { Discussion } from "../types/discussion";
import DiscussionCard from "./DiscussionCard";
import ViewDiscussion from "./ViewDiscussion";
import PostDiscussion from "./PostDiscussion";
import { buildRecipePlatformShareUrl, copyRecipeShareUrl } from "../utils/recipeShare";
import type { RecipeShareTarget } from "../utils/recipeShare";
import SearchSortControls from "../components/SearchSortControls";

type RecipeProps = {
    onSuccess?: () => void;
}


const API_URL = import.meta.env.VITE_API_URL; //Defining the API URL from environment variables for making API requests throughout the component.

//This function normalizes the recipe ingredients data structure, to ensure that the component data structure, matches the expected format regardless of how the backend sends the data
//It checks for different possible property names and formats, and returns a consistent array of ingredients with the correct types.
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

export default function Home({onSuccess}: RecipeProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState("recipes");
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalSuccess, setModalSuccess] = useState("");
    const [modalError, setModalError] = useState("");
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const navigate = useNavigate();


    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
    const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false);
    const [likes, setLikes] = useState<{ [key: number]: boolean }>({}); 
    const [postDiscussionOpen, setPostDiscussionOpen] = useState(false);
    const [recipeQuery, setRecipeQuery] = useState("");
    const [recipeSort, setRecipeSort] = useState("newest");
    const [discussionQuery, setDiscussionQuery] = useState("");
    const [discussionSort, setDiscussionSort] = useState("newest");

    //It is used to handle filter and sort functionality for both recipes and discussions.
    //It uses the useMemo hook to optimize performance by memoizing the filtered and sorted lists, so that they are only recalculated when the relevant dependencies change.
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

    const filteredSortedDiscussions = useMemo(() => {
        const q = discussionQuery.trim().toLowerCase();
        const filtered = discussions.filter((discussion) => {
            if (!q) {
                return true;
            }

            const haystack = [
                discussion.discussionTitle,
                discussion.discussionDescription,
                discussion.firstName,
                discussion.lastName,
                discussion.professionalTitle,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(q);
        });

        const sorted = [...filtered];
        sorted.sort((a, b) => {
            if (discussionSort === "title-asc") {
                return a.discussionTitle.localeCompare(b.discussionTitle);
            }
            if (discussionSort === "title-desc") {
                return b.discussionTitle.localeCompare(a.discussionTitle);
            }

            const aTime = new Date(a.createdAt ?? 0).getTime();
            const bTime = new Date(b.createdAt ?? 0).getTime();
            return discussionSort === "oldest" ? aTime - bTime : bTime - aTime;
        });

        return sorted;
    }, [discussions, discussionQuery, discussionSort]);


    //The useEffect hook is used to check for a shared recipe ID in the URL search parameters when the component mounts or when the active tab, loading state, recipes list, or search parameters change.
    //If a shared recipe ID is found and the recipes are loaded, it attempts to find the corresponding recipe in the current recipe feed and opens it in a modal. If the recipe is not found, it displays an error message.
    //After handling the shared recipe, it removes the recipeId parameter from the URL to prevent repeated attempts to open the same recipe on subsequent renders.
    useEffect(() => {
        const sharedRecipeId = Number(searchParams.get("recipeId"));

        if (!sharedRecipeId || loading || recipes.length === 0) {
            return;
        }

        if (activeTab !== "recipes") { //It sets the active tab to recipes it is not already the active tab. This ensures that when a user clicks on a shared recipe link, they are taken directly to the recipe feed where the shared recipe can be found and viewed.
            setActiveTab("recipes");
            return;
        }

        const matchedRecipe = recipes.find((recipe) => recipe.recipeId === sharedRecipeId);
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("recipeId");

        if (matchedRecipe) {
            void onViewRecipe(matchedRecipe);
        } else {
            setError("Shared recipe not found in the current recipe feed.");
        }

        setSearchParams(nextParams, { replace: true });
    }, [activeTab, loading, recipes, searchParams, setSearchParams]);


    //The useEffect hook ensures that the appropriate data is fetched whenever the active tab changes.
    //If the active tab is set to "recipes", it calls the fetchRecipes function to load the recipe feed. If the active tab is set to "discussions", it calls the fetchDiscussions function to load the discussions feed.
    // This allows users to seamlessly switch between viewing recipes and discussions, with the relevant data being loaded automatically based on their selection.
    useEffect(() => {
        if (activeTab === "recipes") {
            fetchRecipes();
        }

        if (activeTab === "discussions") {
            fetchDiscussions();
        }
    }, [activeTab]);

    useEffect(() => {
        if (!error) {
            return;
        }

        const timer = window.setTimeout(() => {
            setError("");
        }, 2000);

        return () => clearTimeout(timer);
    }, [error]);


    //The fetchRecipes function is responsible for fetching the list of recipes from the server.
    //It sets the loading state to true and clears any existing errors before making the request.
    //If the user is not logged in, it sets an error message and returns early.
    //If the request is successful, it normalizes the recipe data and updates the state with the fetched recipes.
    //If there is an error, it sets an error message and clears the recipes list.
    //Finally, it sets the loading state to false.
    async function fetchRecipes() {
        setLoading(true);
        setError("");

        try{
            const token = getAuthToken();

            if (!token) {
                setRecipes([]);
                setError("Please log in to view recipes, or switch to discussions.");
                return;
            }

            const res = await fetch(`${API_URL}/recipe/all`, {
                headers: {
                    ...getAuthHeaders(),
                },
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "There are currently no recipes available.");
            }

            const recipeList: Recipe[] = Array.isArray(data)
                ? data.map((recipe: any) => ({
                    recipeId: recipe.recipeId ?? recipe.RecipeId ?? recipe.id ?? recipe.Id,
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
        }catch(err){
            console.error(err);
            setRecipes([]);
            setError(err instanceof Error ? err.message : "Unable to load recipes.");
        }finally{
            setLoading(false);
        }
    }

    //The fetchDiscussions function is responsible for fetching the list of discussions from the server.
    //It sets the loading state to true and clears any existing errors before making the request.
    //If the request is successful, it normalizes the discussion data and updates the state with the fetched discussions.
    //If there is an error, it sets an error message and clears the discussions list.
    //Finally, it sets the loading state to false.
    async function fetchDiscussions(){
        setLoading(true);
        setError("");
        try{
            const res = await fetch(`${API_URL}/discussion`, {
                headers: {
                    "content-type": "application/json",
                    ...getAuthHeaders(),
                },
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "Unable to load discussions.");
            }

            const discussionList: Discussion[] = Array.isArray(data)
                ? data.map((discussion: any) => ({
                    discussionId: discussion.discussionId ?? discussion.DiscussionId,
                    discussionTitle: discussion.discussionTitle ?? discussion.DiscussionTitle,
                    discussionDescription: discussion.discussionDescription ?? discussion.DiscussionDescription,
                    createdAt: discussion.createdAt ?? discussion.CreatedAt,
                    profileImageURL: discussion.profileImageURL ?? discussion.ProfileImageURL,
                    firstName: discussion.firstName ?? discussion.FirstName,
                    lastName: discussion.lastName ?? discussion.LastName,
                    professionalTitle: discussion.professionalTitle ?? discussion.ProfessionalTitle,
                    likedByCurrentUser:
                        discussion.likedByCurrentUser ??
                        discussion.LikedByCurrentUser ??
                        discussion.isLiked ??
                        discussion.IsLiked ??
                        discussion.liked ??
                        discussion.Liked ??
                        false,
                }))
                : [];

            setDiscussions(discussionList);
            setLikes(
                Object.fromEntries(
                    discussionList.map((discussion) => [discussion.discussionId, Boolean(discussion.likedByCurrentUser)])
                )
            );

        }
        catch(err){
            console.error(err);
            setDiscussions([]);
            setError(err instanceof Error ? err.message : "Unable to load discussions.");
        }
        finally{
            setLoading(false);
        }
    }

    //The onViewDiscussion function is responsible for handling the event when a user selects a discussion to view its details.
    //It sets the modal state to loading, clears any existing errors or success messages, and opens the discussion modal.
    //If a valid discussion is selected, it fetches the discussion details from the server and updates the state with the fetched data.
    //If there is an error, it sets an error message and clears the selected discussion.
    //Finally, it sets the modal loading state to false.
    async function onViewDiscussion(discussion: Discussion) {
        setModalError("");
        setModalSuccess("");
        setModalLoading(true);
        setSelectedDiscussion(null);
        setIsDiscussionModalOpen(true);
        
        try{
            if (!discussion?.discussionId) {
                setModalError("No discussion selected.");
                return;
            }
            const res = await fetch(`${API_URL}/discussion/${discussion.discussionId}`, {
                headers: {
                    ...getAuthHeaders(),
                },
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(data?.message || "Unable to load discussion. Please try again");
            }
            const discussionDetail: Discussion = {
                discussionId: data.discussionId ?? data.DiscussionId,
                discussionTitle: data.discussionTitle ?? data.DiscussionTitle,
                discussionDescription: data.discussionDescription ?? data.DiscussionDescription,
                createdAt: data.createdAt ?? data.CreatedAt,
                profileImageURL: data.profileImageURL ?? data.ProfileImageURL,
                firstName: data.firstName ?? data.FirstName,
                lastName: data.lastName ?? data.LastName,
                professionalTitle: data.professionalTitle ?? data.ProfessionalTitle,
            };
            setSelectedDiscussion(discussionDetail);
        }
        catch(err){
            console.error(err);
            setSelectedDiscussion(null);
            setModalError(err instanceof Error ? err.message : "Unable to load discussion.");
        }
        finally{
            setModalLoading(false);
        }
    }

    //The onLikeDiscussion function is responsible for handling the event when a user likes a discussion.
    //It checks if the discussion is already liked by the current user and returns early if it is.
    //It sets the error state to an empty string before making the request.
    //If the user is not logged in, it sets an error message and navigates to the login page.
    //If the request is successful, it updates the likes state to reflect the new like.
    //If there is an error, it sets an error message.
    async function onLikeDiscussion(discussionId: number) {
        if (likes[discussionId]) {
            return;
        }

        setError("");

        try{
            const token = getAuthToken();
            if(!token){
                setError("Please login to like this discussion");
                navigate("/login");
                return;
            }
            const res = await fetch(`${API_URL}/discussionlikes/${discussionId}`, {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                },
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                const message = data?.message || "Unable to like discussion. Please try again";

                if (res.status === 400 || res.status === 409 || /already/i.test(message)) {
                    setLikes((prev) => ({ ...prev, [discussionId]: true }));
                    return;
                }

                throw new Error(message);
            }
            setLikes((prev) => ({ ...prev, [discussionId]: true }));

        }
        catch(err){
            console.error(err);
            setError(err instanceof Error ? err.message : "Unable to like discussion.");
        }
    }


    //The onUnlikeDiscussion function is responsible for handling the event when a user unlikes a discussion.
    //It sets the error state to an empty string before making the request.
    //It calls the DELETE endpoint to remove the like from the discussion. If the user is not logged in, it sets an error message and navigates to the login page.
    //If the request is successful, it updates the likes state to reflect the removed like.
    //If there is an error, it sets an error message.
    async function onUnlikeDiscussion(discussionId: number) {
        setError("");

        try{
            const token = getAuthToken();
            if(!token){
                setError("Please login to unlike this discussion");
                navigate("/login");
                return;
            }
            const res = await fetch(`${API_URL}/discussionlikes/${discussionId}`, {
                method: "DELETE",
                headers: {
                    ...getAuthHeaders(),
                },
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                const message = data?.message || "Unable to unlike discussion. Please try again";

                if (res.status === 400 || res.status === 404 || /not\s+liked|already\s+removed/i.test(message)) {
                    setLikes((prev) => ({ ...prev, [discussionId]: false }));
                    return;
                }

                throw new Error(message);
            }
            setLikes((prev) => ({ ...prev, [discussionId]: false }));
        }

        catch(err){
            console.error(err);
            setError(err instanceof Error ? err.message : "Unable to unlike discussion.");
        }
    }

    //The onDeleteDiscussion function is responsible for handling the event when a user deletes a discussion.
    //It sets the error state to an empty string before making the request.
    //It calls the DELETE endpoint to remove the discussion. If the user is not logged in, it sets an error message and navigates to the login page.
    //It also prevents an anauthorized user from deleting a discussion by checking the headers and response status. If the request is successful, it updates the discussions state to reflect the removed discussion.
    //If the request is successful, it updates the discussions state to reflect the removed discussion.
    //If there is an error, it sets an error message.
    async function onDeleteDiscussion(discussion: Discussion) {
        setError("");

        try{
            const token = getAuthToken();
            if(!token){
                setError("Please login to delete this discussion");
                navigate("/login");
                return;
            }
            const res = await fetch(`${API_URL}/discussion/${discussion.discussionId}`, {
                method: "DELETE",
                headers: {
                    ...getAuthHeaders(),
                },
            });

            if(res.status === 401 || res.status === 403) {
                setError("You do not have permission to delete this discussion.");
                return;
            }

            const data = await res.json().catch(() => null);
            if (!res.ok) {
                const message = data?.message || "Unable to delete discussion. Please try again";

                if (res.status === 400 || res.status === 404 || /not\s+found/i.test(message)) {
                    setDiscussions((prev) => prev.filter((d) => d.discussionId !== discussion.discussionId));
                    return;
                }

                throw new Error(message);
            }
            setDiscussions((prev) => prev.filter((d) => d.discussionId !== discussion.discussionId));
        }

        catch(err){
            console.error(err);
            setError(err instanceof Error ? err.message : "Unable to delete discussion.");
        }
    }

    //initiates the saving of a recipe when the user clicks the save button on a recipe card. It sets the selected recipe ID, clears any existing modal messages, and opens the save confirmation modal.
    async function openSaveModal(recipeId: number) {
        setSelectedRecipeId(recipeId);
        setModalError("");
        setModalSuccess("");
        setIsSaveModalOpen(true);
    }

    //initiates the sharing of a recipe when the user clicks the share button on a recipe card. It sets the selected recipe ID, clears any existing modal messages, and opens the share options modal.
    async function openShareModal(recipeId: number) {
        setSelectedRecipeId(recipeId);
        setModalError("");
        setModalSuccess("");
        setIsShareModalOpen(true);
    }

    //The onSaveRecipe function is responsible for handling the event when a user confirms that they want to save a recipe to their profile.
    //It checks if a recipe is selected and if the user is logged in before making the request to save the recipe. If the user is not logged in, it sets an error message and navigates to the login page.
    //It sends a "POST" request to the server with the selected recipe ID to save the recipe.
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
            navigate("/login");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/savedRecipe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({ RecipeId: selectedRecipeId }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "You have already saved this recipe.");
            }

            setModalSuccess("Recipe saved successfully.");
            window.setTimeout(() => {
                setIsSaveModalOpen(false);
                onSuccess?.();
            }, 800);
        } catch (err) {
            setModalError(err instanceof Error ? err.message : "Unexpected error");
        } finally {
            setModalLoading(false);
        }
    }

    //The onViewRecipe function is responsible for handling the event when a user selects a recipe to view its details.
    //It sets the modal state to loading, clears any existing errors or success messages, and opens the view recipe modal.
    //It calls on the ViewRecipe component to display the recipe details in a modal. The function also checks if a valid recipe is selected and if the user is logged in before making the request to fetch the detailed recipe information. If the user is not logged in, it sets an error message and navigates to the login page.
    //If a valid recipe is selected, it fetches the detailed recipe information from the server and updates the state with the fetched data.
    //If there is an error, it sets an error message and clears the selected recipe.
    //Finally, it sets the modal loading state to false.
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
            if (!token) {
                setError("Please login to view this recipe");
                navigate("/login");
                return;
            }

            const res = await fetch(`${API_URL}/recipe/${recipeId}`, {
                method: "GET",
                headers: {
                    ...getAuthHeaders(),
                },
            });
            if (!res.ok) {
                setSelectedRecipe(selectedCard);
                setModalSuccess("Detailed recipe endpoint returned 404. Showing recipe from feed data.");
                return;
            }

            const data = await res.json().catch(() => null);
            if (!data) {
                setSelectedRecipe(selectedCard);
                setModalSuccess("Detailed recipe endpoint returned 404. Showing recipe from feed data.");
                return;
            }

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

    //The onShareRecipe function is responsible for handling the event when a user chooses to share a recipe by copying its URL to the clipboard.
    //It checks if a recipe is selected before attempting to copy the URL. If no recipe is selected, it sets an error message.
    //It uses the copyRecipeShareUrl utility function to copy the recipe's share URL to the clipboard. If the operation is successful, it displays a success message and closes the share modal. If there is an error during the copying process, it displays an error message.
    async function onShareRecipe(recipeId: number) {
        try {
            await copyRecipeShareUrl(recipeId);
            alert("Recipe URL copied to clipboard!");
            setIsShareModalOpen(false);
        } catch {
            alert("Failed to copy URL. Please try again.");
        }
    }

    function onSharePlatform(recipeId: number, target: RecipeShareTarget) {
        const shareUrl = buildRecipePlatformShareUrl(recipeId, target);
        window.open(shareUrl, "_blank");
        setIsShareModalOpen(false);
    }


    //It renders the user interface for the home page.
    //It includes the top heading with options to switch between the recipes and discussions tabs, and displays the appropriate content based on the active tab.
    //It also includes modals for viewing recipe details, saving recipes, and sharing recipes.
    const topLayer = (
        <div className="top_heading">
            <div className="options">
                <button
                    className={activeTab === "recipes" ? "active" : ""}
                    onClick={() => setActiveTab("recipes")}
                >
                    Recipes
                </button>

                <button
                    className={activeTab === "discussions" ? "active" : ""}
                    onClick={() => setActiveTab("discussions")}
                >
                    Discussions
                </button>
            </div>

            <span className="top_badge">{activeTab === "recipes" ? "Recipe Feed" : "Discussions Feed"}</span>
        </div>
    )

    //the page content displays the content of the active tab, including the search and sort controls, the list of recipes or discussions, and the modals for viewing details, saving, and sharing.
    // It also handles loading states, error messages, and empty state messages to provide feedback to the user based on their interactions and the data being displayed.
    const pageContent = (
        <div>
            {activeTab === "recipes" &&(
                <>
                <SearchSortControls
                    query={recipeQuery}
                    onQueryChange={setRecipeQuery}
                    sortValue={recipeSort}
                    onSortChange={setRecipeSort}
                    searchPlaceholder="Search recipes by title, description, or chef..."
                    sortOptions={[
                        { value: "newest", label: "Newest" },
                        { value: "oldest", label: "Oldest" },
                        { value: "title-asc", label: "Title A-Z" },
                        { value: "title-desc", label: "Title Z-A" },
                    ]}
                />
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "crimson" }}>{error}</p>}
                {!loading && !error && filteredSortedRecipes.length === 0 && <p>No recipes found for your search.</p>}

                {filteredSortedRecipes.map((recipe)=>(
                    <RecipeCard
                        key={recipe.recipeId}
                        recipe={recipe}
                        onSave={() => openSaveModal(recipe.recipeId)}
                        onView={() => onViewRecipe(recipe)}
                        onShare={() => openShareModal(recipe.recipeId)}
                    />
                ))}


                <Modal /* //modal to handle a user save recipe request. It confirms if the user wants to save the recipe, and if confirmed, it calls the onSaveRecipe function to perform the save action. It also displays loading, success, and error states based on the outcome of the save operation. */
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

                <Modal /* //modal to handle a user share recipe request. It provides options for sharing the recipe via different platforms and copying the recipe link. It also displays loading, success, and error states based on the outcome of the share operation. */
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


                <Modal  /* //modal to display the detailed view of a selected recipe. It shows the recipe details using the ViewRecipe component and handles loading, success, and error states based on the outcome of fetching the recipe details. */
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

                </>
            )}


            {/* //If ithe active tab is set to "discussions", it renders the discussions feed. It includes search and sort controls, a button to post a new discussion, and a list of discussion cards. 
            //It also handles loading states, error messages, and empty state messages to provide feedback to the user based on their interactions and the data being displayed. */}
            {activeTab === "discussions" &&
                <div  style={{display:"flex", flexDirection:"column", justifyContent: "center",alignItems: "center"}}>
                <SearchSortControls
                    query={discussionQuery}
                    onQueryChange={setDiscussionQuery}
                    sortValue={discussionSort}
                    onSortChange={setDiscussionSort}
                    searchPlaceholder="Search discussions by title, content, or author..."
                    sortOptions={[
                        { value: "newest", label: "Newest" },
                        { value: "oldest", label: "Oldest" },
                        { value: "title-asc", label: "Title A-Z" },
                        { value: "title-desc", label: "Title Z-A" },
                    ]}
                />
                {loading && <p>Loading...</p>}
                {!loading && !error && filteredSortedDiscussions.length === 0 && (
                    <p>No discussions found for your search.</p>
                )}

                <button className="post-discussion-button" style ={{width: "200px"}} onClick={(e) => {
                    e.preventDefault();
                    setPostDiscussionOpen(true);
                }}>
                    Post New Discussion
                </button>

                <Modal
                    isOpen={postDiscussionOpen}
                    hasCloseButton={true}
                    onClose={() => setPostDiscussionOpen(false)}
                >
                    <PostDiscussion onSuccess={() => {
                        setPostDiscussionOpen(false);
                    }} />
                </Modal>


                {error && <p style={{ color: "crimson" }}>{error}</p>}  
                {filteredSortedDiscussions.map((discussion) => (
                    <DiscussionCard
                        key={discussion.discussionId}
                        discussion={discussion}
                        onView={onViewDiscussion}
                        onLike={onLikeDiscussion}
                        onUnlike={onUnlikeDiscussion}
                        onDelete={onDeleteDiscussion}
                        liked={likes[discussion.discussionId]}
                    />
                ))} 
                
                <Modal
                    isOpen={isDiscussionModalOpen}
                    hasCloseButton={true}
                    onClose={() => {
                        setIsDiscussionModalOpen(false);
                        setSelectedDiscussion(null);
                    }}
                >
                    {modalLoading && <p>Loading discussion...</p>}
                    {!modalLoading && selectedDiscussion && (
                        <ViewDiscussion
                            discussion={selectedDiscussion}
                            loading={modalLoading}
                            error={modalError}
                            success={modalSuccess}
                        />
                    )}
                    {!modalLoading && !selectedDiscussion && modalError && (
                        <p style={{ color: "crimson" }}>{modalError}</p>
                    )}
                </Modal>
                
                </div>
                }
        </div>
    )

    return(
       <HomeLayout
            topLayer={topLayer}
            pageContent={pageContent}>
       </HomeLayout>
    )
}