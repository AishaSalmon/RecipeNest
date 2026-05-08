namespace RecipeNest.Models
{
    //The saved recipe class keeps track of recipes that users have saved in the application once logged in.
    //It defines the id and timstamp for when the recipe was saved.
    public class SavedRecipe
    {
        public int SavedRecipeId { get; set; }
        public DateTime SavedAt { get; set; } = DateTime.Now;


        //It establishes a foreign key relationship with the recipe and user classes.
        //This allows users to save multiple recipes, and recipes to be saved by multiple users.
        public int RecipeId { get; set; }
        public Recipe? Recipe { get; set; } //establishes a many to one relationship between the SavedRecipe and Recipe classes, allowing multiple saved recipes to be associated with a single recipe.
        public string? UserId { get; set; }
        public User? User { get; set; }
    }
}
