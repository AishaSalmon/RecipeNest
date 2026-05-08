namespace RecipeNest.Models
{
    //This class represents a chef's profile in the application.
    //It includes properties for the chef's professional title, bio, profile image URL, and visibility status.
    public class ChefProfile
    {
        public int ChefProfileId { get; set; }
        public string ProfessionalTitle { get; set; } = null!;
        public string Bio {  get; set; } = null!;
        public string? ProfileImageURL { get; set; }
        public bool IsProfileVisible { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        //It also has a foreign key relationship to the User class, allowing us to associate a chef profile with a specific user account. It establishes a one to one relationship between the ChefProfile and User classes.
        public string? UserId { get; set; }
        public User? User { get; set; }
    }
}
