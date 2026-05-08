namespace RecipeNest.Models.DTOs
{
    //The Recipe DTO transfers data for a recipe from the server to the client when a recipe is requested.
    //It contains properties that represent the recipe's details, such as its title, description, cooking instructions, image URL, and creation date.
    public class RecipeDto
    {
        public int RecipeId { get; set; }
        public string RecipeTitle { get; set; } = null!;
        public string RecipeDescription { get; set; } = null!;
        public string CookingInstructions { get; set; } = null!;
        public string? RecipeImageURL { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? ProfileImageURL { get; set; }
        public string? ProfessionalTitle { get; set; }
        public DateTime CreatedAt { get; set; }

        //It also includes an established list of RecipeIngredientDto objects that represent the ingredients used in the recipe.
        public List<RecipeIngredientDto> RecipeIngredients { get; set; } = new List<RecipeIngredientDto>();
    }
}
