using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using OrdenExpressAPI.Data;
using OrdenExpressAPI.Services;
using Microsoft.OpenApi.Models;
using OrdenExpressAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
    policy => policy.WithOrigins(
                            "http://localhost:3001",
                            "http://localhost:3000",
                            "http://localhost:5173",
                            "http://127.0.0.1:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

// Controllers
builder.Services.AddControllers();

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddScoped<IFileService, FileService>();

// JWT
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT:Key configuration is required.")))

        };
    });
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Cliente", policy => policy.RequireRole("Cliente"));
    options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("Empleado", policy => policy.RequireRole("Empleado"));
    options.AddPolicy("Cocinero", policy => policy.RequireRole("Cocinero"));
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Pega aqui solo el token JWT. Swagger agregara el prefijo Bearer automaticamente.",
        In = ParameterLocation.Header,
        Name = "Authorization",
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
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseStaticFiles();
app.UseDefaultFiles();
app.UseAuthorization();

// Global Exception Handler
app.UseExceptionHandler(errorApp => {
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var error = new ApiErrorResponse { StatusCode = 500, Message = "Error interno del servidor" };
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(error));
    });
});

app.MapControllers();

app.Run();



