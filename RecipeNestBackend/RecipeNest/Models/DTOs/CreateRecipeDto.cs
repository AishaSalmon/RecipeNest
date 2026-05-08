namespace RecipeNest.Models.DTOs
{
    //This DTO is collects information about a new recipe from the client and transfers it to the server to be stored in the database.
    //It is defined by a POST request body when a user wants to create a new recipe in the application.
    //It takes information as defined in this class.
    public class CreateRecipeDto
    {
        public string RecipeTitle { get; set; } = null!;
        public string RecipeDescription { get; set; } = null!;
        public string CookingInstructions { get; set; } = null!;
        public IFormFile? RecipeImageURL { get; set; }
        public List<RecipeIngredientDto> RecipeIngredients { get; set; } = new List<RecipeIngredientDto>(); 
    }
}
