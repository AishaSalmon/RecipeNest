namespace RecipeNest.Models.DTOs
{
    //When a user login, the login DTO collects the email and password information from the client and transfers it to the server as defined by the POST request body.
    //This information is used to authenticate the user and allow them access to their account in the application.
    public class LoginDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
