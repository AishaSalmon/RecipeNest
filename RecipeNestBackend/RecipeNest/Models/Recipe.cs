namespace RecipeNest.Models
{
    //The recipe class defines the model structure for the recipes in the application.
    //It includes properties for the recipe's title, description, cooking instructions, image URL, creation and update timestamps, deletion status, and visibility status.
    public class Recipe
    {
        public int RecipeId { get; set; }
        public string RecipeTitle { get; set; } = null!;
        public string RecipeDescription { get; set; } = null!;
        public string CookingInstructions { get; set; } = null!;
        public string? RecipeImageURL { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; }
        public bool IsPublic { get; set; }

        //It establishes multiple foreign key relationships with other classes.
        //The user class relationship allows a user to have multiple recipes, while the recipe ingredient and saved recipe relationships allow a recipe to be associated with multiple ingredients and saved by multiple users.
        public string? UserId { get; set; }
        public User? User { get; set; }
        public ICollection<RecipeIngredient> RecipeIngredients { get; set; } = new List<RecipeIngredient>();
        public ICollection<SavedRecipe> SavedRecipes { get; set; } = new List<SavedRecipe>();
    }
}
