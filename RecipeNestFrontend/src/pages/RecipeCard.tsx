import DefaultProfile from "../assets/default-profile.png";
import DefaultRecipeImage from "../assets/default-recipe-image.png";
import type { Recipe } from "../types/recipe";
import "./Home.css";

//the RecipeCard props define the structure of the data and functions that the RecipeCard component expects to receive. It includes the recipe data itself, as well as callback functions for saving, viewing, and sharing the recipe.
//the component uses this information to display the recipe details and provide interactive buttons for user actions.
type RecipeCardProps = {
    recipe: Recipe;
    onSave: (recipeId: number) => void;
    onView: (recipe: Recipe) => void;
    onShare: (recipeId: number) => void;
};


//the recipeCard is responsible for handling the display of individual recipe information in a card format.
//it shows the chef's profile information, the recipe title, description and the image of the recipe.
//it allows for code reuse accross the application. it is to be applied whenever a recipe needs to be displayed in a card format.
export default function RecipeCard({
  recipe,
  onSave,
  onView,
  onShare,
}: RecipeCardProps) {
    const API_URL = import.meta.env.VITE_API_URL;
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

  //the return statement renders the JSX for the RecipeCard component. It includes the chef's profile image, name, professional title, recipe title, description, and action buttons for saving, sharing, and viewing the recipe.
  //the component also handles cases where certain data may be missing by providing default images and fallback text.
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
            <button onClick={() => onSave(recipe.recipeId)}>
              Save
            </button>

            <button onClick={() => onShare(recipe.recipeId)}>
              Share
            </button>

            <button onClick={() => onView(recipe)}>
              View
            </button>
          </div>

        </div>

        <h3>{recipe.recipeTitle}</h3>

        <p className="truncate"> {/* //ensures that the recipe description does not overflow the card and maintains a consistent layout, even if the description is long. */}
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