import DefaultProfile from "../assets/default-profile.png";
import DefaultRecipeImage from "../assets/default-recipe-image.png";
import type { Recipe } from "../types/recipe";

type ViewRecipeProps = {
  recipe: Recipe;
  loading?: boolean;
  error?: string;
  success?: string;
};


//the view recipe page is responsible for displaying the details of a specific recipe, including the chef's information, recipe title, description, ingredients, and cooking instructions. 
// It also handles loading states, error messages, and success notifications to provide feedback to the user throughout their interaction with the page.
// The component ensures that all necessary data is displayed in a user-friendly format, even if some information is missing from the source.
export default function ViewRecipe({
  recipe,
  loading = false,
  error = "",
  success = "",
}: ViewRecipeProps) {
    const API_URL = import.meta.env.VITE_API_URL;

    //the variables profileImageSrc and recipeImageSrc are responsible for determining the correct image URLs for the chef's profile picture and the recipe image, respectively.
    // They handle cases where the URLs may be relative paths or absolute URLs, and they provide default images if no valid URLs are available.
    const profileImageSrc = recipe?.profileImageURL && typeof recipe.profileImageURL === "string"
        ? (recipe.profileImageURL.startsWith("http")
            ? recipe.profileImageURL
            : `${new URL(API_URL).origin}${recipe.profileImageURL.startsWith("/") ? "" : "/"}${recipe.profileImageURL}`)
        : DefaultProfile;
    
    const recipeImageSrc = recipe?.recipeImageURL && typeof recipe.recipeImageURL === "string"
        ? (recipe.recipeImageURL.startsWith("http")
            ? recipe.recipeImageURL
            : `${new URL(API_URL).origin}${recipe.recipeImageURL.startsWith("/") ? "" : "/"}${recipe.recipeImageURL}`)
        : DefaultRecipeImage;

        //the return statement renders the recipe details components, usually displayed in a modal format. It includes a detailed view of the recipe, chef information, recipe title, description, ingredients, and cooking instructions.
        // It also displays loading indicators, error messages, and success notifications based on the component's state.
  return (
    <div className="view-recipe">
      <div className="discussion-card view-recipe__card">
        <div className="chef-info">
          <img
            className="profile-avatar"
            src={profileImageSrc}
            alt="chef"
          />

          <div className="discussion-user">
            <h4>
              {recipe.firstName ?? "Unknown"} {recipe.lastName ?? "Chef"}
            </h4>
            <p>{recipe.professionalTitle ?? "Chef"}</p>
          </div>
        </div>

        <p className="discussion-heading">
          Recipe created on: {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : "Unknown Date"}
        </p>

        <div className="discussion-box">
          <h2>{recipe.recipeTitle}</h2>
          <p>{recipe.recipeDescription}</p>
        </div>

        <div className="view-recipe__image-box">
          <img
            className="view-recipe__image"
            src={recipeImageSrc}
            alt={recipe.recipeTitle}
          />
        </div>

        <div className="discussion-box">
          <h2>Ingredients</h2>
          <ul className="view-recipe__ingredients">
            {recipe.recipeIngredients.length > 0 ? (
              recipe.recipeIngredients.map((ing, index) => (
                <li key={index}>
                  <strong>{ing.ingredientName}</strong>
                  <span>
                    {ing.ingredientQuantity} {ing.unitOfMeasurement}
                  </span>
                </li>
              ))
            ) : (
              <li>No ingredients listed.</li>
            )}
          </ul>
        </div>

        <div className="discussion-box large">
          <h2>Instructions</h2>
          <p className="view-recipe__instructions">{recipe.cookingInstructions}</p>
        </div>

        {loading && <p className="view-recipe__status">Loading...</p>}
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </div>
    </div>
  );
}