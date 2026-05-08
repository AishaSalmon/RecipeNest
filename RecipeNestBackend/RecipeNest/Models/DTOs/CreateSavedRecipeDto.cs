namespace RecipeNest.Models.DTOs
{
    //When a user wants to save a recipe, this DTO collects the recipe ID from the client and transfers it to the server defined by the POST request body.
    //The server then uses this information to create a new saved recipe entry in the database, associating the saved recipe with the user and the specified recipe.
    public class CreateSavedRecipeDto
    {
        public int RecipeId { get; set; }
    }
}
