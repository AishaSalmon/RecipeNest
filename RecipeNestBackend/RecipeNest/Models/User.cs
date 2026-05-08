using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace RecipeNest.Models
{
    //The user class represents the users of the application, including both regular users and chefs.
    //It inherits from IdentityUser, which provides built-in properties and functionality for user authentication and management.
    //Properties such as userId, email, username, phone number, and password are inherited from IdentityUser, while additional properties such as first name, last name, timestamps, and active status are defined in the User class.
    public class User : IdentityUser
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public bool IsActive { get; set; }
        public ChefProfile? ChefProfile { get; set; } //one to one relationship with ChefProfile class
        public ICollection<Recipe> Recipes { get; set; } = new List<Recipe>(); //one to many relationship with Recipe class
        public ICollection<Discussion> Discussions { get; set; } = new List<Discussion>(); //one to many relationship with Discussion class
        public ICollection<SavedRecipe> SavedRecipes { get; set; } = new List<SavedRecipe>(); //one to many relationship with SavedRecipe class
        public ICollection<DiscussionLikes> DiscussionLikes { get; set; } = new List<DiscussionLikes>(); //one to many relationship with DiscussionLikes class
    }
}