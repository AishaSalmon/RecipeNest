namespace RecipeNest.Models
{
    //This is passed as a list to the Recipe class to represent the ingredients needed for a recipe. It defines the properties for the ingredient name, quantity, and unit of measurement.
    //It also has a foreign key relationship to the Recipe class, allowing us to associate each ingredient with a specific recipe.
    public class RecipeIngredient
    {
        public int RecipeIngredientId { get; set; }
        public string IngredientName { get; set; } = null!;
        public int? IngredientQuantity { get; set; }
        public string? UnitOfMeasurement { get; set; }

        public int RecipeId { get; set; }
        public Recipe? Recipe { get; set; }
    }
}
