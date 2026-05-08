namespace RecipeNest.Models.DTOs
{
    //The update recipe DTO represents the recipe information that is updated and passed down through it from the client to the server when a user wants to edit their recipe details.
    public class UpdateRecipeDto
    {
        public string RecipeTitle { get; set; } = null!;
        public string RecipeDescription { get; set; } = null!;
        public string CookingInstructions { get; set; } = null!;
        public IFormFile? RecipeImageURL { get; set; }

        public List<RecipeIngredientDto> RecipeIngredients { get; set; } = new List<RecipeIngredientDto>();
    }
}
