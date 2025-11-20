using Microsoft.EntityFrameworkCore;
using TodoApi;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// הגדרת אימות JWT
var jwtSettings = builder.Configuration.GetSection("Jwt");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["Key"]))
        };
    });

builder.Services.AddAuthorization();

// הגדרת CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Swagger עם תמיכה ב-JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ToDo API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Database
builder.Services.AddDbContext<ToDoDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("ToDoDB"),
        new MySqlServerVersion(new Version(8, 0, 44))));

var app = builder.Build();

// Swagger בפיתוח בלבד
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ToDo API v1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// פונקציה לקבלת UserId מה-token
int GetUserId(ClaimsPrincipal user)
{
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    return int.Parse(userIdClaim ?? "0");
}

// GET /tasks - רק משימות של המשתמש המחובר
app.MapGet("/tasks", [Authorize] async (ClaimsPrincipal user, ToDoDbContext db) =>
{
    var userId = GetUserId(user);
    return await db.Items.Where(item => item.UserId == userId).ToListAsync();
});

// POST /tasks - יצירת משימה חדשה למשתמש המחובר
app.MapPost("/tasks", [Authorize] async (ClaimsPrincipal user, ToDoDbContext db, Item newTask) =>
{
    var userId = GetUserId(user);
    newTask.UserId = userId;
    
    db.Items.Add(newTask);
    await db.SaveChangesAsync();
    return Results.Created($"/tasks/{newTask.Id}", newTask);
});

// PUT /tasks/{id} - עדכון רק אם זו משימה של המשתמש
app.MapPut("/tasks/{id}", [Authorize] async (int id, ClaimsPrincipal user, ToDoDbContext db, Item updatedTask) =>
{
    var userId = GetUserId(user);
    var task = await db.Items.FindAsync(id);
    
    if (task is null) return Results.NotFound();
    if (task.UserId != userId) return Results.Forbid();

    task.Name = updatedTask.Name;
    task.IsComplete = updatedTask.IsComplete;

    await db.SaveChangesAsync();
    return Results.Ok(task);
});

// DELETE /tasks/{id} - מחיקה רק אם זו משימה של המשתמש
app.MapDelete("/tasks/{id}", [Authorize] async (int id, ClaimsPrincipal user, ToDoDbContext db) =>
{
    var userId = GetUserId(user);
    var task = await db.Items.FindAsync(id);
    
    if (task is null) return Results.NotFound();
    if (task.UserId != userId) return Results.Forbid();

    db.Items.Remove(task);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Register
app.MapPost("/register", async (User user, ToDoDbContext db) =>
{
    if (db.Users.Any(u => u.Username == user.Username))
        return Results.BadRequest("User already exists");

    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Ok("User registered successfully");
});

// Login - עם הוספת UserId ל-token
app.MapPost("/login", (User loginUser, ToDoDbContext db, IConfiguration config) =>
{
    var user = db.Users.FirstOrDefault(u =>
        u.Username == loginUser.Username && u.Password == loginUser.Password);

    if (user == null) return Results.Unauthorized();

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    // הוספת Claims עם UserId
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Username)
    };

    var token = new JwtSecurityToken(
        issuer: config["Jwt:Issuer"],
        audience: config["Jwt:Audience"],
        claims: claims,
        expires: DateTime.Now.AddHours(2),
        signingCredentials: creds
    );

    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
    return Results.Ok(new { token = tokenString });
});

app.MapGet("/", () => "Hello World!");

app.Run();