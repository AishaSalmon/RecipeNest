using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeNest.Data;
using RecipeNest.Models;
using RecipeNest.Models.DTOs;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class SavedRecipeController : ControllerBase
{
    private readonly RecipeNestDbContext _context;

    public SavedRecipeController(RecipeNestDbContext context)
    {
        _context = context;
    }


    //SAVE recipe. This endpoint allows an authenticated user to save a recipe to their list of saved recipes.
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> SaveRecipe(CreateSavedRecipeDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
            return Unauthorized();

        // ✅ Validate that the recipe exists
        var recipeExists = await _context.Recipes
            .AnyAsync(r => r.RecipeId == dto.RecipeId);

        if (!recipeExists)
            return NotFound($"Recipe with ID {dto.RecipeId} not found");

        // prevent duplicate save
        var alreadySaved = await _context.SavedRecipes
            .AnyAsync(sr => sr.UserId == userId && sr.RecipeId == dto.RecipeId);

        if (alreadySaved)
            return BadRequest("Recipe already saved");

        var saved = new SavedRecipe
        {
            UserId = userId,
            RecipeId = dto.RecipeId,
            SavedAt = DateTime.UtcNow
        };

        _context.SavedRecipes.Add(saved);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Recipe saved" });
    }



    //GET my saved recipes. This gets a list of all saved recipes for a particular user.
    //It retrieves the saved recipes from the database, including the related recipe details, and returns them as a list of RecipeDto objects.
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetSavedRecipes()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
            return Unauthorized();

        var recipes = await _context.SavedRecipes
            .Where(sr => sr.UserId == userId)
            .Include(sr => sr.Recipe)
            .Select(sr => new RecipeDto
            {
                RecipeId = sr.Recipe.RecipeId,
                RecipeTitle = sr.Recipe.RecipeTitle,
                RecipeDescription = sr.Recipe.RecipeDescription,
                CookingInstructions = sr.Recipe.CookingInstructions,
                RecipeImageURL = sr.Recipe.RecipeImageURL,

                CreatedAt = sr.Recipe.CreatedAt,
                ProfessionalTitle = sr.Recipe.User.ChefProfile.ProfessionalTitle, 
                ProfileImageURL = sr.Recipe.User.ChefProfile.ProfileImageURL,
                FirstName = sr.Recipe.User.FirstName,
                LastName = sr.Recipe.User.LastName,
            })
            .ToListAsync();

        return Ok(recipes);
    }



    //UNSAVE recipe. THis deletes the saved recipe entry for the user and the specified recipe.
    //It checks if the saved entry exists before attempting to delete it, returning a 404 if not found.
    [Authorize]
    [HttpDelete("{recipeId}")]
    public async Task<IActionResult> UnsaveRecipe(int recipeId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var saved = await _context.SavedRecipes
            .FirstOrDefaultAsync(sr => sr.UserId == userId && sr.RecipeId == recipeId);

        if (saved == null)
            return NotFound();

        _context.SavedRecipes.Remove(saved);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Recipe unsaved" });
    }
}