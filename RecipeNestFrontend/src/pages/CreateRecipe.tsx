import { useState } from "react";
import RN_logo from "../assets/RecipeNest.png";
import { getAuthHeaders } from "../utils/auth";
import "./Main.css";

//the recipeIngredientPayload type defines the structure of the ingredient data that will be sent to the backend when creating a new recipe. It includes the ingredient's name, quantity, and unit of measurement.
type RecipeIngredientPayload = {
    IngredientName: string;
    IngredientQuantity: string;
    UnitOfMeasurement: string;
};

//the CreateRecipePayload type defines the structure of the data that will be sent to the backend when creating a new recipe. It includes the recipe's title, description, cooking instructions, an optional image file, and an array of ingredients.
type CreateRecipePayload = {
    RecipeTitle: string;
    RecipeDescription: string;
    CookingInstructions: string;
    RecipeImageURL: File | null;
    RecipeIngredients: RecipeIngredientPayload[];
};

//the create recipe props define the strructure of the props that it can receive. It currently only accepts an optional onSuccess callback function that will be called after a recipe is successfully created.
type CreateRecipeProps = {
    onSuccess?: () => void;
};


//this function is responsible for rendering the create recipe page. It handles the state, submission logic and form rendering for creating a new recipe.
export default function CreateRecipe({ onSuccess }: CreateRecipeProps) {
    const API_URL = import.meta.env.VITE_API_URL;
    const [form, setForm] = useState<CreateRecipePayload>({ //settign the form useState to nill, ensuring that all input fields are empty when the page is first loaded.
        RecipeTitle: "",
        RecipeDescription: "",
        CookingInstructions: "",
        RecipeImageURL: null,
        RecipeIngredients: [
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

    //this function handles changes to the form input fields. It updates the form, setting the corresponding field to the new value. If the input is a file input, it updates the form with the selected file instead of a string value.
    function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name } = e.target;

        if (e.target instanceof HTMLInputElement && e.target.type === "file") {
            const file = e.target.files?.[0] || null;
            setForm((prev) => ({ ...prev, [name]: file }));
            return;
        }

        setForm((prev) => ({ ...prev, [name]: e.target.value }));
    }

    //this function handles changes to the ingredient input fields. It updates the form, setting the corresponding field of the specified ingredient to the new value.
    function onIngredientChange(index: number, field: keyof RecipeIngredientPayload, value: string) {
        setForm((prev) => ({
            ...prev,
            RecipeIngredients: prev.RecipeIngredients.map((ingredient, ingredientIndex) =>
                ingredientIndex === index ? { ...ingredient, [field]: value } : ingredient
            ),
        }));
    }

    //the addIngredient function adds a new ingredient to the form by appending a new ingredient object with empty fields to the RecipeIngredients array in the form state.
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

    //the removeIngredient function removes an ingredient from the form by filtering out the ingredient at the specified index from the RecipeIngredients array in the form state.
    function removeIngredient(index: number) {
        setForm((prev) => ({
            ...prev,
            RecipeIngredients:
                prev.RecipeIngredients.length === 1
                    ? prev.RecipeIngredients
                    : prev.RecipeIngredients.filter((_, ingredientIndex) => ingredientIndex !== index),
        }));
    }

    //when a user submits a form to create a new recipe, the onSubmit function is called.
    //It validates the form and ensures that at least one complete ingredient is provided.
    // The function also handles loading states, error messages, and success notifications to provide feedback to the user throughout the process.
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

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

                // If validation passes, it constructs a FormData object with the recipe details and sends a POST request to the backend API to create the recipe.
            const res = await fetch(`${API_URL}/recipe/form`, {
                method: "POST",
                headers: {
                    ...getAuthHeaders(), //ensuring that users are authenticated before they can create a recipe. It retrieves the user JWT token form the local storage.
                },
                body: formData,
            });

            const rawText = await res.text(); //handling responses from the backend.
            let data: any = null;

            try {
                data = rawText ? JSON.parse(rawText) : null;
            } catch {
                data = rawText;
            }

            if (!res.ok) {
                throw new Error((typeof data === "string" && data) || data?.message || "Recipe creation failed");
            }

            setSuccess("Recipe created successfully.");
            setForm({  //once user has successfully created a recipe, the form is reset to an initial blank state, allowing the user to create another recipe if they wish.
                RecipeTitle: "",
                RecipeDescription: "",
                CookingInstructions: "",
                RecipeImageURL: null,
                RecipeIngredients: [
                    {
                        IngredientName: "",
                        IngredientQuantity: "",
                        UnitOfMeasurement: "",
                    },
                ],
            });

            window.setTimeout(() => {  //it closes the modal after a short delay.
                onSuccess?.();
            }, 800);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unexpected error");
        } finally {
            setLoading(false);
        }
    }

    //the component renders a form with input fields for the recipe title, description, cooking instructions, an optional image upload, and a dynamic list of ingredients. 
    // Users can add or remove ingredient fields as needed. The form also includes a submit button that triggers the onSubmit function when clicked. 
    // Feedback messages are also displayed.
    return (
        <section className="RegisterPage">
            <div className="Reg_card">
                <div className="Reg_card_header">
                    <div className="logo">
                        <img src={RN_logo} alt="Recipe Nest Logo" width={40} height={40} />
                    </div>

                    <div>
                        <h2>Create a New Recipe</h2>
                        <p className="muted">Share your dish with the RecipeNest community.</p>
                    </div>
                </div>
            </div>

            <section className="createPostDiscussionForm">
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

                        <button type="button" className="post-discussion-button" onClick={addIngredient}> {/* //button that triggers the addIngredient function. */}
                            Add Ingredient
                        </button>
                    </div>

                    <button className="post-discussion-button" type="submit" disabled={loading}> {/* //button submits the form and triggers the onSubmit function. It is disabled while the form is being submitted to prevent multiple submissions. */}
                        {loading ? "Creating..." : "Create Recipe"}
                    </button>
                    {error && <p style={{ color: "crimson" }}>{error}</p>}
                    {success && <p style={{ color: "green" }}>{success}</p>}
                </form>
            </section>
        </section>
    );
}