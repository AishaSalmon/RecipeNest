namespace RecipeNest.Models.DTOs
{
    //THis dto transfers saved recipe information from the server to the client as requested by the logged in user.
    public class SavedRecipeDto
    {
        public int RecipeId { get; set; }
        public DateTime SavedAt { get; set; } = DateTime.Now;
    }
}
