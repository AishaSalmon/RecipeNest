using Microsoft.EntityFrameworkCore;
using RecipeNest.Data;
using RecipeNest.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using RecipeNest.Interfaces;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<RecipeNestDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("RecipeNestDatabase")));

builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<RecipeNestDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddScoped<IEmailService, EmailService>();



builder.Services.Configure<IdentityOptions>(options =>
{
    //password settings
    options.Password.RequireDigit = true; //require at least one digit
    options.Password.RequireLowercase = true;  //require at least one lowercase letter
    options.Password.RequireNonAlphanumeric = true; //requires at least one non-alphanumeric character
    options.Password.RequireUppercase = true; // require at least one uppercase letter
    options.Password.RequiredLength = 8; //requires a minimum length of 8 characters
    options.Password.RequiredUniqueChars = 1;  //requires at least one unique character

    //User settings - configure user settings to specify allowed characters in usernames and whether unique email addresses are required
    options.User.AllowedUserNameCharacters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
    options.User.RequireUniqueEmail = true;
});


builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "JwtBearer";
    options.DefaultChallengeScheme = "JwtBearer";
})
    .AddJwtBearer("JwtBearer", options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("//Replace with desired secret key - consistent with the secret key in appsettigns.json file"))
        };
    });


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")  //replace with your frontend URL 
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseStaticFiles();


app.UseCors("AllowReact");

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
