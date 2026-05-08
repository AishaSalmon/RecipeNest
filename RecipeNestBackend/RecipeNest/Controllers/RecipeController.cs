using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using RecipeNest.Models;
using System.Security.Claims;
using RecipeNest.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using RecipeNest.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.OutputCaching;


namespace RecipeNest.Controllers
{
    //This controller is responsible for handling all recipe-related operations in the server.
    //It runs as an API controller. It ensures that only authenticated users can access and manipulate their recipe endpointss.
    //The controller interacts with the database context to perform CRUD operations on recipes, allowing only authorized users to create, read, update, and delete their recipes securely.

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]

    public class RecipeController : ControllerBase //inheriting from controllerbase as an API controller, for handling HTTP requests related to recipes
    {
        private readonly RecipeNestDbContext _context;

        public RecipeController(UserManager<User> userManager, RecipeNestDbContext context)
        {
            _context = context;
        }


        //Getting each recipe by its user's ID and recipe ID, ensuring that only the owner of the recipe can access it.
        //If the user is not authenticated or if the recipe does not exist, error responses are returned.
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRecipeById(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var recipes = await _context.Recipes
                .Where(r => r.UserId == userId && r.RecipeId == id)
                .Select(r => new RecipeDto
                {
                    RecipeId = r.RecipeId,
                    RecipeTitle = r.RecipeTitle,
                    RecipeDescription = r.RecipeDescription,
                    CookingInstructions = r.CookingInstructions,
                    RecipeIngredients = r.RecipeIngredients
                        .Select(i => new RecipeIngredientDto
                        {
                            IngredientName = i.IngredientName,
                            IngredientQuantity = i.IngredientQuantity,
                            UnitOfMeasurement = i.UnitOfMeasurement
                        }).ToList(),
                    RecipeImageURL = r.RecipeImageURL,

                    CreatedAt = r.CreatedAt,

                    FirstName = r.User.FirstName,
                    LastName = r.User.LastName,
                    ProfileImageURL = r.User.ChefProfile.ProfileImageURL,
                    ProfessionalTitle = r.User.ChefProfile.ProfessionalTitle,

                }).FirstOrDefaultAsync();

            if (recipes == null)
            {
                return NotFound("Recipe not found");
            }

            return Ok(recipes);
        }


        //Getting all recipes for the authenticated user, ensuring that only the owner of the recipes can access them.
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAllUserRecipes()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var recipes = await _context.Recipes
                .Where(r => r.UserId == userId)
                .Select(r => new RecipeDto
                {
                    RecipeId = r.RecipeId,
                    RecipeTitle = r.RecipeTitle,
                    RecipeDescription = r.RecipeDescription,
                    CookingInstructions = r.CookingInstructions,
                    RecipeIngredients = r.RecipeIngredients
                        .Select(i => new RecipeIngredientDto
                        {
                            IngredientName = i.IngredientName,
                            IngredientQuantity = i.IngredientQuantity,
                            UnitOfMeasurement = i.UnitOfMeasurement
                        }).ToList(),
                    RecipeImageURL = r.RecipeImageURL,
                    CreatedAt = r.CreatedAt,

                    FirstName = r.User.FirstName,
                    LastName = r.User.LastName,
                    ProfileImageURL = r.User.ChefProfile.ProfileImageURL,
                    ProfessionalTitle = r.User.ChefProfile.ProfessionalTitle,
                }).ToListAsync();

            if (recipes == null || recipes.Count == 0)
            {
                return NotFound("Recipes not found");
            }

            return Ok(recipes);
        }

        [Authorize]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllRecipes()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if(userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var recipes = await _context.Recipes
                .Include(r => r.User)
                .ThenInclude(u => u.ChefProfile)
                .Select(r => new RecipeDto
                {
                    RecipeId = r.RecipeId,
                    RecipeTitle = r.RecipeTitle,
                    RecipeDescription = r.RecipeDescription,
                    CookingInstructions = r.CookingInstructions,
                    RecipeIngredients = r.RecipeIngredients
                        .Select(i => new RecipeIngredientDto
                        {
                            IngredientName = i.IngredientName,
                            IngredientQuantity = i.IngredientQuantity,
                            UnitOfMeasurement = i.UnitOfMeasurement
                        }).ToList(),
                    RecipeImageURL = r.RecipeImageURL,
                    CreatedAt = r.CreatedAt,

                    FirstName = r.User.FirstName,
                    LastName = r.User.LastName,
                    ProfileImageURL = r.User.ChefProfile.ProfileImageURL,
                    ProfessionalTitle = r.User.ChefProfile.ProfessionalTitle,
                }).ToListAsync();

            if (recipes == null || recipes.Count == 0)
            {
                return NotFound("No recipes found");
            }

            return Ok(recipes);
        }

        //Post operation to create a new recipe for the authenticated user.
        //This endpoint accepts form-data (supports optional image upload).
        [Authorize]
        [HttpPost("form")]
        public async Task<IActionResult> CreateRecipe([FromForm] CreateRecipeDto createRecipeDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized("User not authenticated");

            string? imagePath = null;

            if(createRecipeDto.RecipeImageURL != null)
            {
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(),"wwwroot/images");

                //To ensure the wwwroot/images folder exists before saving the image
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }

                //To generate a unique filename for the uploaded image to prevent overwriting existing files
                var filename = Guid.NewGuid().ToString() + Path.GetExtension(createRecipeDto.RecipeImageURL.FileName);

                var filePath = Path.Combine(folderPath, filename);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await createRecipeDto.RecipeImageURL.CopyToAsync(stream);
                }
                imagePath = "/images/" + filename;
            }

            var recipe = new Recipe
            {
                RecipeTitle = createRecipeDto.RecipeTitle,
                RecipeDescription = createRecipeDto.RecipeDescription,
                CookingInstructions = createRecipeDto.CookingInstructions,
                RecipeImageURL = imagePath,
                CreatedAt = DateTime.Now,
                UserId = userId,
                RecipeIngredients = createRecipeDto.RecipeIngredients
                    .Select(i => new RecipeIngredient
                    {
                        IngredientName = i.IngredientName,
                        IngredientQuantity = i.IngredientQuantity,
                        UnitOfMeasurement = i.UnitOfMeasurement
                    }).ToList()
            };

            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRecipeById), new { id = recipe.RecipeId },
                new
                {
                    message = "Recipe created successfully",
                    recipeId = recipe.RecipeId
                }
            );
        }


        //This is the delete enpoint. It performs the operation to remove a specific recipe by its ID for the authenticated user.
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecipe(int id)
        {
            //Authenticating and retrieving the user ID from the JWT token claims
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            //if user ID is null (meaning it's not authenticated, we return an Unauthorized response
            if (userId == null)
                return Unauthorized("User not authenticated");

            //getting recipe for the signed in user with the provided recipe ID. If no recipe is found, we return a NotFound response
            var recipe = await _context.Recipes.FirstOrDefaultAsync(r => r.RecipeId == id && r.UserId == userId);

            if (recipe == null)
                return NotFound("Recipe not found");

            //Ensuring that if the recipe has an associated image, we delete the image file from the server to prevent orphaned files and save storage space
            if (!string.IsNullOrEmpty(recipe.RecipeImageURL))
            {
                var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", recipe.RecipeImageURL.TrimStart('/'));
                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                }
            }

            _context.Recipes.Remove(recipe);

            await _context.SaveChangesAsync();

            return Ok("Recipe deleted successfully");
        }


        //Deleting all recipes for the authenticated user, ensuring that only the owner of the recipes can delete them.
        //If no recipes are found, a NotFound response is returned. If ithe requests is successful, an Ok response is returned with a success message.
        //This endpoint allows users to delete all their recipes at once.
        [Authorize]
        [HttpDelete]
        public async Task<IActionResult> DeleteAllRecipes()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized("User not authenticated");

            var recipes = await _context.Recipes.Where(r => r.UserId == userId).ToListAsync();

            if (recipes == null || recipes.Count == 0)
                return NotFound("No recipes found to delete");

            _context.Recipes.RemoveRange(recipes);

            await _context.SaveChangesAsync();
            return Ok("All recipes deleted successfully");
        }



        //The PUT operation to update an existing recipe by its ID for the currently signed in user. 
        //It accepts an UpdateRecipeDto object containing the updated recipe details from the frontend, including an optional new image file.
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRecipe(int id, UpdateRecipeDto updateRecipeDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized("User not authenticated");

            var recipe = await _context.Recipes.Include(r => r.RecipeIngredients).FirstOrDefaultAsync(r => r.RecipeId == id && r.UserId == userId);

            if (recipe == null)
                return NotFound("Recipe not found");

            recipe.RecipeTitle = updateRecipeDto.RecipeTitle;
            recipe.RecipeDescription = updateRecipeDto.RecipeDescription;
            recipe.CookingInstructions = updateRecipeDto.CookingInstructions;

            _context.RecipeIngredients.RemoveRange(recipe.RecipeIngredients);
            recipe.RecipeIngredients = updateRecipeDto.RecipeIngredients
                .Select(i => new RecipeIngredient
                {
                    IngredientName = i.IngredientName,
                    IngredientQuantity = i.IngredientQuantity,
                    UnitOfMeasurement = i.UnitOfMeasurement
                }).ToList();
            recipe.UpdatedAt = DateTime.Now;

            if (updateRecipeDto.RecipeImageURL != null)
            {
                if (!string.IsNullOrEmpty(recipe.RecipeImageURL))
                {
                    var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", recipe.RecipeImageURL.TrimStart('/'));
                    if (System.IO.File.Exists(oldPath))
                        System.IO.File.Delete(oldPath);
                }

                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images");
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }
                //var filename = Guid.NewGuid().ToString() + Path.GetExtension(createRecipeDto.RecipeImageURL.FileName);
                var filename = Guid.NewGuid().ToString() + Path.GetExtension(updateRecipeDto.RecipeImageURL.FileName);
                var filePath = Path.Combine(folderPath, filename);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await updateRecipeDto.RecipeImageURL.CopyToAsync(stream);
                }
                recipe.RecipeImageURL = "/images/" + filename;
            }


            _context.Recipes.Update(recipe);

            await _context.SaveChangesAsync();
            return Ok(new
            {
                recipe.RecipeId,
                recipe.RecipeTitle,
                recipe.RecipeDescription,
                recipe.RecipeIngredients,
                recipe.CookingInstructions,
                recipe.RecipeImageURL
            });
        }
    }
}