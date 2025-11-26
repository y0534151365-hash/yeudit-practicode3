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

// ✅ CORS - מאפשר הכל (לצורך הדגמה)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ToDo API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
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
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

builder.Services.AddDbContext<ToDoDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("ToDoDB"),
        new MySqlServerVersion(new Version(8, 0, 44))));

var app = builder.Build();

// app.UseSwagger();
// app.UseSwaggerUI(c =>
// {
//     c.SwaggerEndpoint("/swagger/v1/swagger.json", "ToDo API v1");
//     c.RoutePrefix = string.Empty;
// });

// app.UseCors("AllowAll");
// app.UseAuthentication();
// app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ToDo API v1");
    c.RoutePrefix = string.Empty;
});

app.UseRouting();      // ← חדש
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// מכאן כל ה־MapGet / MapPost וכו'...


int GetUserId(ClaimsPrincipal user)
{
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    return int.Parse(userIdClaim ?? "0");
}

app.MapGet("/tasks", [Authorize] async (ClaimsPrincipal user, ToDoDbContext db) =>
{
    var userId = GetUserId(user);
    return await db.Items.Where(item => item.UserId == userId).ToListAsync();
});

app.MapPost("/tasks", [Authorize] async (ClaimsPrincipal user, ToDoDbContext db, Item newTask) =>
{
    var userId = GetUserId(user);
    newTask.UserId = userId;
    db.Items.Add(newTask);
    await db.SaveChangesAsync();
    return Results.Created($"/tasks/{newTask.Id}", newTask);
});

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

app.MapPost("/register", async (User user, ToDoDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(user.Username) || string.IsNullOrWhiteSpace(user.Password))
        return Results.BadRequest("Username and password are required");
    if (user.Password.Length < 6)
        return Results.BadRequest("Password must be at least 6 characters");
    if (db.Users.Any(u => u.Username == user.Username))
        return Results.BadRequest("User already exists");
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "User registered successfully" });
});

app.MapPost("/login", (User loginUser, ToDoDbContext db, IConfiguration config) =>
{
    if (string.IsNullOrWhiteSpace(loginUser.Username) || string.IsNullOrWhiteSpace(loginUser.Password))
        return Results.BadRequest("Username and password are required");
    var user = db.Users.FirstOrDefault(u => u.Username == loginUser.Username && u.Password == loginUser.Password);
    if (user == null) return Results.Unauthorized();
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
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

app.MapGet("/", () => Results.Ok(new { status = "Server running", time = DateTime.Now }));

app.Run();