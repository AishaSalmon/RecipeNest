import DefaultProfile from "../assets/default-profile.png";
import DefaultRecipeImage from "../assets/default-recipe-image.png";
import type { Recipe } from "../types/recipe";
import "./Home.css";

//The recipeCard props type define the structure of the props that the RecipeCard component expects to receive.
//On calling the RecipeCard component, it receives the recipe object as well as functions for handling view, edit, delete, and share actions on the recipe.
type RecipeCardProps = {
    recipe: Recipe;
    onView: (recipe: Recipe) => void;
    onEdit: () => void;
    onDelete: (recipeId: number) => void;
    onShare: (recipeId: number) => void;
};

//RecipeCard page is responsible for displaying a recipe card with the user's profile information along with the recipe details. 
//It includes the buttons for viewing, editing, deleting, and sharing the recipe. The component also handles the display of profile and recipe images, using default images if none are provided.
// The onView, onEdit, onDelete, and onShare functions are passed as props to handle the respective actions when the buttons are clicked.
export default function RecipeCard({
  recipe,
  onEdit,
  onView,
  onDelete,
  onShare,
}: RecipeCardProps) {
    const API_URL = import.meta.env.VITE_API_URL;
    // The profileImageSrc and recipeImageSrc variables determine the source URLs for the profile and recipe images, respectively.
    // They handle both absolute and relative paths, falling back to default images if necessary.
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

  return (
    <div className="cardd">

      <div className="recipe-content">

        <div className="recipeHeader">

          <img
            className="profile-avatar"
            src={profileImageSrc}
            alt="chef"
          />

          <div className="profile">
            <h4>{recipe.firstName} {recipe.lastName}</h4>
            <p>{recipe.professionalTitle ?? "Chef"}</p>
          </div>

          <div className="actions">

            <button onClick={() => onView(recipe)}>
              View
            </button>

            <button onClick={() => onDelete(recipe.recipeId)}>
              Delete
            </button>

             <button onClick={() => onEdit()}>
              Edit
            </button>

            <button onClick={() => onShare(recipe.recipeId)}>
              Share
            </button>
          </div>

        </div>

        <h3>{recipe.recipeTitle}</h3>

        <p className="truncate">
          {recipe.recipeDescription}
        </p>

      </div>

      <div className="recipe-image">
        <img
          src={recipeImageSrc}
          alt={recipe.recipeTitle}
        />
      </div>

    </div>
  );
}