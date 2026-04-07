using Mapster;
using MapsterMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Microsoft.SemanticKernel;
using Npgsql;
using Scalar.AspNetCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Plugins;
using SmartStudy.Server.Services;
using System.Reflection;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.OpenApi;
using SmartStudy.Server.Middlewares;
using SmartStudy.Server.Services.AI;
using Hangfire;
using Hangfire.PostgreSql;
using Hangfire.Redis.StackExchange;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(opts => {
        opts.JsonSerializerOptions.NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowNamedFloatingPointLiterals;
    });

// Cấu hình OpenAPI với .NET 10
builder.Services.AddOpenApi("v1", options =>
{
    options.ShouldInclude=(desc)=>desc.GroupName!="Internal"; // Loại bỏ các endpoint có GroupName là "Internal" ra khỏi tài liệu OpenAPI
    options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info = new OpenApiInfo
        {
            Title = "Smart Study Planner API",
            Version = "v1",
            Description = "API for Smart Study Planner application"
        };
        return Task.CompletedTask;
    });
});

builder.Services.AddOpenApi("ai-tools", options => {
    options.AddDocumentTransformer((document, context, cancellationToken) => {
        document.Info.Title = "Smart Study AI Internal Tools";
        document.Info.Description = "Danh sách các hàm hỗ trợ RAG và xử lý Task dành riêng cho AI Agent";
        return Task.CompletedTask;
    });

    // QUAN TRỌNG: Chỉ lấy các endpoint thuộc nhóm "internal"
    options.ShouldInclude = (description) => description.GroupName == "Internal";
});

// Lấy chuỗi kết nối từ file cấu hình (config)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var redisConnectionString = builder.Configuration.GetConnectionString("Redis");

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
    
    var kernel = builder.Build();
    kernel.Plugins.AddFromObject(sp.GetRequiredService<UIPlugin>(), "UIPlugin");
    kernel.Plugins.AddFromObject(sp.GetRequiredService<StudyPlugin>(), "StudyPlugin");
    kernel.Plugins.AddFromObject(sp.GetRequiredService<TaskExecutionPlugin>(), "TaskExecutionPlugin");

    return kernel;
});

// Cấu hình Mapster
var config = TypeAdapterConfig.GlobalSettings;
config.Scan(Assembly.GetExecutingAssembly());

builder.Services.AddSingleton(config);

// Đăng ký dịch vụ tùy chỉnh
builder.Services.AddScoped<IAuthService, AuthService>()
                .AddScoped<IUserService, UserService>()
                .AddScoped<ICurrentUserService, CurrentUserService>()
                .AddScoped<IStudyPlanService, StudyPlanService>()
                .AddScoped<IScheduleService, ScheduleService>()
                .AddScoped<ITaskService, TaskService>()
                .AddScoped<ICloudService, CloudinaryService>()
                .AddScoped<IAssetService, AssetService>()
                .AddScoped<IAssetLinkService, AssetLinkService>()
                .AddScoped<IRoutineService, RoutineService>()
                .AddScoped<ILogService, LogService>()
                .AddScoped<ICourseService, CourseService>()
                .AddScoped<ITimelineEventService, TimelineEventService>()
                .AddScoped<IRoutineService, RoutineService>()
                .AddScoped<IChatService, ChatService>()
                .AddScoped<ISubjectService, SubjectService>()
                .AddScoped<IStudentDashboardService, StudentDashboardService>()
                .AddScoped<IAdminDashboardService, AdminDashboardService>()
                .AddScoped<IDatabaseSeeder, DatabaseSeeder>()
                .AddScoped<IMeaningfulSeeder,MeaningfulSeeder>()
                .AddScoped<IPlanTemplateService, PlanTemplateService>()
                .AddScoped<ICalendarService, CalendarService>()
                .AddScoped<IDocumentChunkService,DocumentChunkService>()
                .AddScoped<UIWidgetCollector>()
                .AddScoped<UIPlugin>()
                .AddScoped<StudyPlugin>()
                .AddScoped<TaskExecutionPlugin>()
                .AddScoped<RoutineTaskGenerator>()
                .AddScoped<IRagJobService, RagJobService>()
                .AddScoped<IInternalService, InternalService>()
                .AddScoped<IMapper, ServiceMapper>();

// Background job dọn các asset 
builder.Services.AddHostedService<GarbageCollectorJob>();

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = redisConnectionString;
    options.InstanceName = "SmartStudy_";
});

builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseRedisStorage(redisConnectionString));

builder.Services.AddHangfireServer();

// Http client giao tiếp 3rd-party
builder.Services.AddHttpClient<ILlamaParseService, LlamaParseService>(client =>
{
    var baseUrl = builder.Configuration["AiService:BaseUrl"] ?? "http://smartstudy_ai:8000";
    client.BaseAddress = new Uri(baseUrl);

    client.Timeout = TimeSpan.FromMinutes(5);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});
builder.Services.AddHttpClient<IChatService, ChatService>(client =>
{
    var baseUrl = builder.Configuration["AiService:BaseUrl"] ?? "http://smartstudy_ai:8000";
    client.BaseAddress = new Uri(baseUrl);

    client.Timeout = TimeSpan.FromMinutes(5);
});
builder.Services.AddHttpClient<IEmbeddingService, GeminiEmbeddingService>();

// Enable dynamic JSON serialization cho Npgsql
var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.EnableDynamicJson();
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

dataSourceBuilder.UseVector();

var dataSource = dataSourceBuilder.Build();

// Cấu hình DbContext với PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
    {
        options.UseNpgsql(dataSource,
            o => o.UseVector());
    }
);

// Sau khi cấu hình xong mới bắt đầu build ứng dụng
var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

app.UseDefaultFiles();
app.MapStaticAssets();

// Kích hoạt CORS - PHẢI ĐẶT TRƯỚC Authentication/Authorization
app.UseCors("AllowReactApp");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Map OpenAPI JSON endpoint - Tạo file JSON specification tại /openapi/v1.json
    var openApiEndpoint = app.MapOpenApi();
    openApiEndpoint.AllowAnonymous(); // Cho phép truy cập mà không cần authentication

    // Map Scalar UI endpoint - Tài liệu API tại /scalar/v1
    app.MapScalarApiReference(options =>
    {
        options.Title = "Smart Study Planner API";
        options.Theme = ScalarTheme.Mars;
        // Scalar sẽ tự động đọc từ /openapi/v1.json
    });
    
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<IDatabaseSeeder>();
    await seeder.SeedAsync();
}

app.UseHttpsRedirection();

// Thứ tự middleware
app.UseAuthentication(); // 1. Kiểm tra danh tính (Token có hợp lệ không ?)
app.UseAuthorization(); // 2. Kiểm tra quyền hạn (Người dùng này được làm gì ?)

// Dashboard hangfire
app.UseHangfireDashboard("/hangfire");
await RegisterRecurringJobsWithRetryAsync(app.Services);

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();

static async Task RegisterRecurringJobsWithRetryAsync(IServiceProvider services)
{
    const string jobId = "daily-routine-task-generator";
    const string cron = "0 1 * * *"; // chạy 1h mỗi ngày
    const int maxAttempts = 5;

    using var scope = services.CreateScope();
    var loggerFactory = scope.ServiceProvider.GetRequiredService<ILoggerFactory>();
    var logger = loggerFactory.CreateLogger("HangfireRecurringJobs");
    var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();

    for (var attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            recurringJobManager.AddOrUpdate<RoutineTaskGenerator>(
                jobId,
                generator => generator.GenerateUpcomingTasksAsync(),
                cron);

            logger.LogInformation("Recurring job '{JobId}' registered successfully.", jobId);
            return;
        }
        catch (PostgreSqlDistributedLockException ex) when (attempt < maxAttempts)
        {
            var delay = TimeSpan.FromSeconds(Math.Min(30, attempt * 5));
            logger.LogWarning(
                ex,
                "Could not acquire distributed lock while registering recurring job '{JobId}' (attempt {Attempt}/{MaxAttempts}). Retrying in {DelaySeconds}s.",
                jobId,
                attempt,
                maxAttempts,
                delay.TotalSeconds);
            await Task.Delay(delay);
        }
        catch (PostgreSqlDistributedLockException ex)
        {
            logger.LogError(
                ex,
                "Failed to register recurring job '{JobId}' after {MaxAttempts} attempts due to distributed lock timeout. App will continue running.",
                jobId,
                maxAttempts);
            return;
        }
    }
}

// Document Transformer để thêm Bearer Authentication vào OpenAPI
internal sealed class BearerSecuritySchemeTransformer(IAuthenticationSchemeProvider authenticationSchemeProvider) : IOpenApiDocumentTransformer
{
    public async Task TransformAsync(OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        var authenticationSchemes = await authenticationSchemeProvider.GetAllSchemesAsync();
        if (authenticationSchemes.Any(authScheme => authScheme.Name == "Bearer"))
        {
            // Đảm bảo Components được khởi tạo
            if (document.Components == null)
            {
                document.Components = new OpenApiComponents();
            }

            // Đảm bảo SecuritySchemes được khởi tạo
            if (document.Components.SecuritySchemes == null)
            {
                document.Components.SecuritySchemes = new Dictionary<string, IOpenApiSecurityScheme>();
            }

            // Thêm Bearer security scheme
            document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                In = ParameterLocation.Header,
                BearerFormat = "JWT",
                Description = "Nhập JWT Bearer token"
            };

            // Thêm security requirement cho tất cả operations
            if (document.Paths != null)
            {
                foreach (var pathItem in document.Paths.Values)
                {
                    if (pathItem?.Operations != null)
                    {
                        foreach (var operation in pathItem.Operations.Values)
                        {
                            if (operation?.Security != null)
                            {
                                var securityRequirement = new OpenApiSecurityRequirement
                                {
                                    [new OpenApiSecuritySchemeReference("Bearer", document)] = []
                                };
                                operation.Security.Add(securityRequirement);
                            }
                        }
                    }
                }
            }
        }
    }
}
