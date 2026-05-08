namespace RecipeNest.Models.DTOs
{
    //The RecipeIngredientDto class represents the recipe ingredient details as present in the database and is transferred from the server to the client when a user wants to view the recipe details.
    //It is used to transfer the recipe ingredient information from the server to the client when a user wants to view the recipe details.
    public class RecipeIngredientDto
    {
        public string IngredientName { get; set; } = null!;
        public int? IngredientQuantity { get; set; }
        public string? UnitOfMeasurement { get; set; }
    }
}
