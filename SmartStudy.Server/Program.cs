using Mapster;
using MapsterMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.SemanticKernel;
using SmartStudy.Server.Data;
using SmartStudy.Server.Data.Interceptors;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Plugins;
using SmartStudy.Server.Services.AI;
using SmartStudy.Server.Services.AssetLink;
using SmartStudy.Server.Services.AssetService;
using SmartStudy.Server.Services.Auth;
using SmartStudy.Server.Services.Cloud;
using SmartStudy.Server.Services.Course;
using SmartStudy.Server.Services.Semester;
using SmartStudy.Server.Services.Routine;
using SmartStudy.Server.Services.Task;
using SmartStudy.Server.Services.TaskLog;
using SmartStudy.Server.Services.UserService;
using SmartStudy.Server.Services.LearningPath;
using SmartStudy.Server.Services.Goal;
using SmartStudy.Server.Services.Chat;

using Npgsql;
using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.OpenApi;



var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(opts => opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var jwtSecurityScheme = new OpenApiSecurityScheme
    {
        BearerFormat = "JWT",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = JwtBearerDefaults.AuthenticationScheme,
        Description = "Nhập JWT token",
    };

    options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, jwtSecurityScheme);
});

// Lấy chuỗi kết nối từ file cấu hình (config)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddHttpContextAccessor();

// Cấu hình Identity
builder.Services.AddIdentity<User, IdentityRole<int>>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Cấu hình JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        // Tiến hành đọc từ App Setting (biến môi trường)
        // Chỉ ra Issuer (Người phát hành - Server) hợp lệ 
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        // Chỉ ra Audience (Người nhận - Client) hợp lệ 
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecurityKey"] ?? "CustomSecretKey"))
    };
});

var geminiApiKey = builder.Configuration["Gemini:ApiKey"];
var modelId = "gemini-2.5-flash";

builder.Services.AddScoped<Kernel>(sp =>
{
    var builder = Kernel.CreateBuilder();

    // Thêm Gemini
    builder.AddGoogleAIGeminiChatCompletion(
        modelId: "gemini-2.5-flash-lite",
        apiKey: geminiApiKey);

    // QUAN TRỌNG: Lấy UIPlugin từ DI và nạp vào Kernel
    var uiPlugin = sp.GetRequiredService<UIPlugin>();
    builder.Plugins.AddFromObject(uiPlugin, "UIPlugin"); // Đặt tên rõ ràng

    return builder.Build();
});

// Cấu hình Mapster
var config = TypeAdapterConfig.GlobalSettings;
config.Scan(Assembly.GetExecutingAssembly());

builder.Services.AddSingleton(config);

// Đăng ký dịch vụ tùy chỉnh
builder.Services.AddScoped<IAuthService, AuthService>()
                .AddScoped<ICurrentUserService, CurrentUserService>()
                .AddScoped<ISemesterService, SemesterService>()
                .AddScoped<ITaskService, TaskService>()
                .AddScoped<ICloudService, CloudinaryService>()
                .AddScoped<IAssetService, AssetService>()
                .AddScoped<IAIService, SemanticAIService>()
                .AddScoped<IAssetLinkService, AssetLinkService>()
                .AddScoped<IRoutineService, RoutineService>()
                .AddScoped<ILogService, LogService>()
                .AddScoped<ILearningPathService, LearningPathService>()
                .AddScoped<IGoalService, GoalService>()
                .AddScoped<ICourseService, CourseService>()
                .AddScoped<IRoutineService, RoutineService>()
                .AddScoped<IChatService, ChatService>()
                .AddScoped<UIWidgetCollector>()
                .AddScoped<UIPlugin>()
                .AddScoped<IMapper, ServiceMapper>();

// Đăng ký Interceptor để xóa file trên Cloudinary khi xóa bản ghi Asset
builder.Services.AddScoped<CloudinaryDeleteInterceptor>();

// Enable dynamic JSON serialization cho Npgsql
var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.EnableDynamicJson();
var dataSource = dataSourceBuilder.Build();

// Cấu hình DbContext với PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
{
    var interceptor = serviceProvider.GetRequiredService<CloudinaryDeleteInterceptor>();
    options.UseNpgsql(dataSource)
              .AddInterceptors(interceptor);
}
);

// Sau khi cấu hình xong mới bắt đầu build ứng dụng
var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Thứ tự middleware
app.UseAuthentication(); // 1. Kiểm tra danh tính (Token có hợp lệ không ?)
app.UseAuthorization(); // 2. Kiểm tra quyền hạn (Người dùng này được làm gì ?)

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
