import { useState, useEffect } from "react";
import RN_logo from "../assets/RecipeNest.png";
import { getAuthHeaders, getAuthToken } from "../utils/auth";
import "./Main.css";
import type { Recipe } from "../types/recipe";
import { useNavigate } from "react-router-dom";

//the RecipeIngredientPayload and EditRecipePayload types define the structure of the data used for editing a recipe, including the recipe's title, description, cooking instructions, image, and ingredients. 
// the payload types define the structure of the data that will be sent to the backend API when editing a recipe.
//The EditRecipe component provides a form for users to edit their recipes, handling form state, validation, and submission to the backend API.
//It also manages loading states and displays success or error messages based on the outcome of the update operation.
type RecipeIngredientPayload = {
    IngredientName: string;
    IngredientQuantity: string;
    UnitOfMeasurement: string;
};

type EditRecipePayload = {
    RecipeId?: number;
    RecipeTitle: string;
    RecipeDescription: string;
    CookingInstructions: string;
    RecipeImageURL: File | null;
    RecipeIngredients: RecipeIngredientPayload[];
};

//the props consists of an optional onSuccess callback function that can be called after a successful recipe edit, and an optional recipe object, which coontain existing recipe data of the Recipe being edited. 
//If the recipe prop is provided, the form will be pre-populated with the existing recipe data, allowing the user to make changes and update the recipe. If no recipe is provided, the form will be empty, allowing the user to create a new recipe from scratch.
type EditRecipeProps = {
    onSuccess?: () => void;
    recipe?: Recipe | null;
};

// The EditRecipe component is responsible for rendering a form that allows users to edit their recipes.
//It manages the form state, handles user input, validates the form data, and submits the updated recipe information to the backend API.
export default function EditRecipe({ onSuccess, recipe }: EditRecipeProps) {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [form, setForm] = useState<EditRecipePayload>({ //the form state is initialized with the existing recipe data if it is available, or set with a defaul nill values if no recipe is provided.
        RecipeId: recipe?.recipeId,
        RecipeTitle: recipe?.recipeTitle || "",
        RecipeDescription: recipe?.recipeDescription || "",
        CookingInstructions: recipe?.cookingInstructions || "",
        RecipeImageURL: null,
        RecipeIngredients: recipe?.recipeIngredients.map((ingredient) =>({
            IngredientName: ingredient.ingredientName,
            IngredientQuantity: ingredient.ingredientQuantity.toString(),
            UnitOfMeasurement: ingredient.unitOfMeasurement,
        })) || [
            {
                IngredientName: "",
                IngredientQuantity: "",
                UnitOfMeasurement: "",
            },
        ],
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    //the useEffect hook is used to update the form state whenever the recipe prop changes. This ensures that if a different recipe is passed to the component, the form will be updated with the new recipe's data,
    useEffect(() => {
        setError("");
        setSuccess("");
        setForm({
            RecipeId: recipe?.recipeId,
            RecipeTitle: recipe?.recipeTitle || "",
            RecipeDescription: recipe?.recipeDescription || "",
            CookingInstructions: recipe?.cookingInstructions || "",
            RecipeImageURL: null,
            RecipeIngredients: recipe?.recipeIngredients.map((ing) => ({
                IngredientName: ing.ingredientName,
                IngredientQuantity: ing.ingredientQuantity.toString(),
                UnitOfMeasurement: ing.unitOfMeasurement,
            })) || [{ IngredientName: "", IngredientQuantity: "", UnitOfMeasurement: "" }],
        });
    }, [recipe]);

    //it handles the form input changes and file uploads.
    function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name } = e.target;

        if (e.target instanceof HTMLInputElement && e.target.type === "file") {
            const file = e.target.files?.[0] || null;
            setForm((prev) => ({ ...prev, [name]: file }));
            return;
        }

        setForm((prev) => ({ ...prev, [name]: e.target.value }));
    }

    //these functions handle the dynamic addition, modification, and removal of ingredients in the form.
    // The onIngredientChange function updates the specific ingredient's field based on user input, while the addIngredient and removeIngredient functions allow users to manage the list of ingredients dynamically.
    function onIngredientChange(index: number, field: keyof RecipeIngredientPayload, value: string) {
        setForm((prev) => ({
            ...prev,
            RecipeIngredients: prev.RecipeIngredients.map((ingredient, ingredientIndex) =>
                ingredientIndex === index ? { ...ingredient, [field]: value } : ingredient
            ),
        }));
    }

    function addIngredient() {
        setForm((prev) => ({
            ...prev,
            RecipeIngredients: [
                ...prev.RecipeIngredients,
                {
                    IngredientName: "",
                    IngredientQuantity: "",
                    UnitOfMeasurement: "",
                },
            ],
        }));
    }

    function removeIngredient(index: number) {
        setForm((prev) => ({
            ...prev,
            RecipeIngredients:
                prev.RecipeIngredients.length === 1
                    ? prev.RecipeIngredients
                    : prev.RecipeIngredients.filter((_, ingredientIndex) => ingredientIndex !== index),
        }));
    }

    //it handles the form submission, including validation, API request, and response handling.
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        //when the form is submitted, the function validates the data, then ensures that there is at least one complete ingredient, it then trims the imput values and removes any incomplete ingredients from the submission
        //  If the validation passes, it constructs a FormData object to send the updated recipe data to the backend API via a PUT request. The function also handles the API response, updating the UI with success or error messages accordingly. 
        const validIngredients = form.RecipeIngredients.filter(
            (ingredient) =>
                ingredient.IngredientName.trim() &&
                ingredient.IngredientQuantity.trim() &&
                ingredient.UnitOfMeasurement.trim()
        );

        if (!form.RecipeTitle.trim() || !form.RecipeDescription.trim() || !form.CookingInstructions.trim()) {
            setError("Please fill in the title, description, and cooking instructions.");
            setLoading(false);
            return;
        }

        if (validIngredients.length === 0) {
            setError("Please add at least one complete ingredient.");
            setLoading(false);
            return;
        }

        try {
            const token = getAuthToken();
            if (!token) { //if the user is not authenticated, the functon sets an error message and redirects the user to the login page.
                setError("You must be logged in to edit a recipe.");
                setLoading(false);
                navigate("/login");
                return;
            }
            if (!form.RecipeId) {
                setError("Please select a recipe to edit.");
                setLoading(false);
                return;
            }

            //appending the formdata with updated recipe information, pairing it with appropriate keys that the bakcend API expects through the DTO.
            const formData = new FormData();
            formData.append("RecipeTitle", form.RecipeTitle);
            formData.append("RecipeDescription", form.RecipeDescription);
            formData.append("CookingInstructions", form.CookingInstructions);

            if (form.RecipeImageURL) {
                formData.append("RecipeImageURL", form.RecipeImageURL);
            }

            validIngredients.forEach((ingredient, index) => {
                formData.append(`RecipeIngredients[${index}].IngredientName`, ingredient.IngredientName);
                formData.append(`RecipeIngredients[${index}].IngredientQuantity`, ingredient.IngredientQuantity);
                formData.append(`RecipeIngredients[${index}].UnitOfMeasurement`, ingredient.UnitOfMeasurement);
            });

            const res = await fetch(`${API_URL}/recipe/${form.RecipeId}`, { //the function sends a PUT request to the backend API.
                method: "PUT",
                headers: {
                    ...getAuthHeaders(), //authenticates user with token headers
                },
                body: formData,
            });

            const rawText = await res.text();
            let data: any = null;

            try {
                data = rawText ? JSON.parse(rawText) : null;
            } catch {
                data = rawText;
            }

             // Additionally, it includes a verification step for server errors to check if the recipe was actually updated in the database, providing a more robust user experience.
            if (!res.ok) {
                const serverMessage = typeof data === "string" ? data : data?.message;

                // Some backend failures happen after DB changes are committed (for example response serialization).
                // Verify persisted data before showing a failure to avoid false negative UI states.
                if (res.status >= 500 && form.RecipeId) {
                    const verifyRes = await fetch(`${API_URL}/recipe/${form.RecipeId}`, {
                        method: "GET",
                        headers: {
                            ...getAuthHeaders(),
                        },
                    });

                    //if the data has been updated, it sends a GET rquest to retrieve the updated data. It compares the data, if successful, it shows a success message.
                    if (verifyRes.ok) {
                        const verifyData = await verifyRes.json().catch(() => null);
                        const verifyIngredients = verifyData?.recipeIngredients ?? verifyData?.RecipeIngredients ?? [];
                        const titleMatches = (verifyData?.recipeTitle ?? verifyData?.RecipeTitle ?? "") === form.RecipeTitle;
                        const descriptionMatches = (verifyData?.recipeDescription ?? verifyData?.RecipeDescription ?? "") === form.RecipeDescription;
                        const instructionMatches = (verifyData?.cookingInstructions ?? verifyData?.CookingInstructions ?? "") === form.CookingInstructions;
                        const ingredientsMatchCount = Array.isArray(verifyIngredients) && verifyIngredients.length === validIngredients.length;

                        if (titleMatches && descriptionMatches && instructionMatches && ingredientsMatchCount) {
                            setSuccess("Recipe updated successfully.");
                            window.setTimeout(() => { //displaying the success message for 2 seconds before calling the onSuccess callback to allow the user to see the confirmation of their update.
                                onSuccess?.();
                            }, 2000);
                            return;
                        }
                    }
                }

                throw new Error(serverMessage || `Recipe update failed (${res.status})`);
            }

            //a success message is set and the form is updated with the latest recipe data.
            setSuccess("Recipe updated successfully.");
            setForm({
                RecipeId: recipe?.recipeId,
                RecipeTitle: recipe?.recipeTitle || "",
                RecipeDescription: recipe?.recipeDescription || "",
                CookingInstructions: recipe?.cookingInstructions || "",
                RecipeImageURL: null,
                RecipeIngredients: [
                    {
                        IngredientName: "",
                        IngredientQuantity: "",
                        UnitOfMeasurement: "",
                    },
                ],
            });

            window.setTimeout(() => {
                onSuccess?.();
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unexpected error");
        } finally {
            setLoading(false);
        }
    }

    //the return statement renders the form for editing the recipe selected by user.
    //it returns a form page, pre-populated with the existing recipe data, allowing the uer to make changes and update the recipe.
    return (
        <section className="RegisterPage">
            <div className="Reg_card">
                <div className="Reg_card_header">
                    <div className="logo">
                        <img src={RN_logo} alt="Recipe Nest Logo" width={40} height={40} />
                    </div>

                    <div>
                        <h2>Edit your Recipe</h2>
                        <p className="muted">Share your dish with RecipeNest.</p>
                    </div>
                </div>
            </div>

            <section className="createPostDiscussionForm"> {/* //the form for editing the recipe, which includes fields for the recipe title, description, cooking instructions, image upload, and dynamic ingredient management. */}
                <form className="generalQuestions" onSubmit={onSubmit}>
                    <label className="question">Recipe Title
                        <input
                            type="text"
                            name="RecipeTitle"
                            value={form.RecipeTitle}
                            onChange={onChange}
                            placeholder="Enter recipe title"
                        />
                    </label>

                    <label className="question">Recipe Description
                        <textarea
                            name="RecipeDescription"
                            value={form.RecipeDescription}
                            onChange={onChange}
                            placeholder="Write a short description of the recipe"
                            rows={4}
                            style={{ resize: "none", borderRadius: "10px", padding: "10px" }}
                        />
                    </label>

                    <label className="question">Cooking Instructions
                        <textarea
                            name="CookingInstructions"
                            value={form.CookingInstructions}
                            onChange={onChange}
                            placeholder="Write the cooking steps"
                            rows={8}
                            style={{ resize: "none", borderRadius: "10px", padding: "10px" }}
                        />
                    </label>

                    <label className="question">Recipe Image
                        <p className="muted" style={{fontSize: "11px"}}>Upload an image of your dish (optional). Selecting a new image will replace the existing one.</p>
                        <input
                            type="file"
                            accept="image/*"
                            name="RecipeImageURL"
                            onChange={onChange}
                        />
                    </label>

                    <div className="question">
                        <span>Ingredients</span>
                        {form.RecipeIngredients.map((ingredient, index) => (
                            <div key={index} style={{ display: "grid", gap: "10px", marginBottom: "10px" }}>
                                <input
                                    type="text"
                                    value={ingredient.IngredientName}
                                    onChange={(e) => onIngredientChange(index, "IngredientName", e.target.value)}
                                    placeholder="Ingredient name"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={ingredient.IngredientQuantity}
                                    onChange={(e) => onIngredientChange(index, "IngredientQuantity", e.target.value)}
                                    placeholder="Quantity"
                                />
                                <input
                                    type="text"
                                    value={ingredient.UnitOfMeasurement}
                                    onChange={(e) => onIngredientChange(index, "UnitOfMeasurement", e.target.value)}
                                    placeholder="Unit of measurement"
                                />
                                {form.RecipeIngredients.length > 1 && (
                                    <button
                                        type="button"
                                        className="post-discussion-button"
                                        onClick={() => removeIngredient(index)}
                                    >
                                        Remove Ingredient
                                    </button>
                                )}
                            </div>
                        ))}

                        <button type="button" className="post-discussion-button" onClick={addIngredient}>
                            Add Ingredient
                        </button>
                    </div>

                    <button className="post-discussion-button" type="submit" disabled={loading}>{/* //on submit. If loading is true, the button will be disabled and show "Editing..." to indicate that the update process is in progress. Otherwise, it will show "Update Recipe". */}
                        {loading ? "Editing..." : "Update Recipe"}
                    </button>
                    {error && <p style={{ color: "crimson" }}>{error}</p>}
                    {success && <p style={{ color: "green" }}>{success}</p>}
                </form>
            </section>
        </section>
    );
}