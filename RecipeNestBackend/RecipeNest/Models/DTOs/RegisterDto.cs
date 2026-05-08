namespace RecipeNest.Models.DTOs
{
    //THe register DTO collects new user registration information from the client and transfers it to the server when a user wants to create a new account in the application.
    //The data is defined by the POST request body and is used to create a new user account in the database.
    public class RegisterDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? PhoneNumber { get; set; }
    }
}
