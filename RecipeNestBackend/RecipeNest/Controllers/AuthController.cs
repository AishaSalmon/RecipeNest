using Humanizer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using RecipeNest.Interfaces;
using RecipeNest.Models;
using RecipeNest.Models.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


//This is the controller responsible for handling user authentication, including registration and login functionalities.
//It used ASP.NET Core Identity for its user management and authenticaion features, inheriting form controllerbase.
//This controller has two main endpoints: /register for user registration and /login for user login.
namespace RecipeNest.Controllers
{
    [ApiController] //This indicates that this controller will be used to handle API requests and responses.
    [Route("api/[controller]")] //THis defines the base route for all endpoints in this controller. For this controller, the base routh will be /api/auth.
    public class AuthController : ControllerBase
    {
        //This calls the UserManager service from ASP.NET Core Identity, which provides methods for creating and managing users.
        private readonly UserManager<User> _userManager;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;

        //THe constructor takes UserManager<User> as a parameter, allowing it to be public and to be an injected dependency when the controller is instantiated.
        public AuthController(UserManager<User> userManager, IEmailService emailService, IConfiguration config)
        {
            _userManager = userManager;
            _emailService = emailService;
            _config = config;
        }

       
        //The register endpoint defined by a POST request. /api/auth/register.
        [HttpPost("register")]
        //This is an asychronous method that takes a RegisterDto object as input, which contains the user's registration details and passes it to the UserManager to create a new user.
        //if the request is sucessful, it returns an OK response else, a BadRequest response with the errors from the Microsoft.AspNetCore.Mvc namespace.
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            var user = new User
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                PhoneNumber = registerDto.PhoneNumber,
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok("User created");
        }



        //The login endpoint defined by a POST request. /api/auth/login.
        [HttpPost("login")]
        //This is an asynchronous method that takes a LoginDto object as input, which contains the user's login credentials. It checks if the user exists and if the password is correct using the UserManager.
        //If the credientials tally with the stored user data, it generates a JWT token for the user and return an OK response with the token and user details. If not, it generates an error message.
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
                return Unauthorized("Invalid email or password");

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
                email = user.Email,
                user.FirstName,
                user.LastName,
            });
        }

        //This is the forgot password endpoint defined by a POST request. It checks for the existence of an already registered user.
        //If the user exists, a reset link would be sent to their email address. The reset link contains a token that allows the user to reset their password securely.
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);

            if (user == null)
            {
                return Ok(new { message = "If the email exists, a reset link has been sent" });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            var resetLink = $"http://localhost:5173/reset-password?email={dto.Email}&token={Uri.EscapeDataString(token)}"; //Replace the URL with your frontend URL eg {http://localhost:5173}

            var emailBody = $@"
                <h2>Password Reset</h2>
                <p>Click the link below to reset your password:</p>
                <a href='{resetLink}'>Reset Password</a>
            ";

            await _emailService.SendEmailAsync(
                dto.Email,
                "Reset Your Password",
                emailBody
            );

            return Ok(new { message = "Reset link sent to your email" });

        }


        //The reset-password endpoint defined by a POST request. /api/auth/reset-password.
        //It is an asynchronous method that takes a ResetPasswordDto object as input.
        //Usermanager confirms if the user exists and use the credentials passed through the dto to change the password.
        //If the password is successfully updated, it returns an OK response with a success message.
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);

            if (user == null)
            {
                return BadRequest("Invalid request");
            }

            var result = await _userManager.ResetPasswordAsync(
                user,
                dto.Token,
                dto.NewPassword
                );

            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Invalid or expired token", errors = result.Errors });
            }

            return Ok("Password has been updated");
        }

        //I defined a custom method GenerateJwtToken that takes a User object as input and generates a JWT token for that user and returns it as a string, ready to be used for authentication and decoding by the server when further requests are sent.
        //The token includes the claim, expiration time, and signing credentials.
        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["JWT:SecretKey"]));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}")
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
