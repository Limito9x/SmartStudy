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
using SmartStudy.Server.Services;
using System.Reflection;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.OpenApi;
using SmartStudy.Server.Middlewares;
using Hangfire;
using Hangfire.Redis.StackExchange;
using SmartStudy.Server.Jobs;
using SmartStudy.Server.Integrations.Cloud;
using SmartStudy.Server.Integrations.Neo4j;
using SmartStudy.Server.Hubs;
using Neo4j.Driver;

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
var modelId = "gemini-2.5-flash-lite";

builder.Services.AddScoped<Kernel>(sp =>
{
    var builder = Kernel.CreateBuilder();

    // Thêm Gemini
    builder.AddGoogleAIGeminiChatCompletion(
        modelId: modelId,
        apiKey: geminiApiKey);
    
    var kernel = builder.Build();
    return kernel;
});

// Cấu hình Mapster
var config = TypeAdapterConfig.GlobalSettings;
config.Scan(Assembly.GetExecutingAssembly());

builder.Services.AddSingleton(config);

// Đăng ký dịch vụ tích hợp
builder.Services.AddScoped<ICloudClient, CloudinaryClient>();
builder.Services.AddScoped<IAiApiClient, AiApiClient>();

// Đăng ký dịch vụ tùy chỉnh
builder.Services.AddScoped<IAuthService, AuthService>()
                .AddScoped<IUserService, UserService>()
                .AddScoped<ICurrentUserService, CurrentUserService>()
                .AddScoped<IStudyPlanService, StudyPlanService>()
                .AddScoped<IScheduleService, ScheduleService>()
                .AddScoped<ITaskService, TaskService>()
                .AddScoped<IAssetService, AssetService>()
                .AddScoped<IAssetLinkService, AssetLinkService>()
                .AddScoped<IRoutineService, RoutineService>()
                .AddScoped<ILogService, LogService>()
                .AddScoped<ICourseService, CourseService>()
                .AddScoped<IPhaseService, PhaseService>()
                .AddScoped<IRoutineService, RoutineService>()
                .AddScoped<IChatService, ChatService>()
                .AddScoped<ISubjectService, SubjectService>()
                .AddScoped<IStudentDashboardService, StudentDashboardService>()
                .AddScoped<IAdminDashboardService, AdminDashboardService>()
                .AddScoped<IDatabaseSeeder, DatabaseSeeder>()
                .AddScoped<IMeaningfulSeeder,MeaningfulSeeder>()
                .AddScoped<IPlanTemplateService, PlanTemplateService>()
                .AddScoped<ICalendarService, CalendarService>()
                .AddScoped<IRoutineTaskGenerator,RoutineTaskGenerator>()
                .AddScoped<IRoutineClearJob, RoutineClearJob>()
                .AddScoped<IRagJobService, RagJobService>()
                .AddScoped<IGarbageCollectorJob, GarbageCollectorJob>()
                .AddScoped<IGraphSyncBackgroundJob, GraphSyncBackgroundJob>()
                .AddScoped<IInternalService, InternalService>()
                .AddScoped<IMapper, ServiceMapper>();


// Neo4j
var neo4jUri = builder.Configuration["Neo4j:Uri"];
var neo4jUser = builder.Configuration["Neo4j:User"];
var neo4jPass = builder.Configuration["Neo4j:Password"];

// Khởi tạo Driver và đăng ký Singleton
var neo4jDriver = GraphDatabase.Driver(neo4jUri, AuthTokens.Basic(neo4jUser, neo4jPass));
builder.Services.AddSingleton(neo4jDriver);

builder.Services.AddScoped<INeo4jClient, Neo4jClient>();
builder.Services.AddScoped<IGraphSyncService, GraphSyncService>();

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

builder.Services.AddSignalR();

// Http client giao tiếp 3rd-party
builder.Services.AddHttpClient<IAiApiClient, AiApiClient>(client =>
{
    var baseUrl = builder.Configuration["AiService:BaseUrl"] ?? "http://smartstudy_ai:8000";
    client.BaseAddress = new Uri(baseUrl);

    client.Timeout = TimeSpan.FromMinutes(5);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

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
        options.UseSnakeCaseNamingConvention();
    }
);

// Sau khi cấu hình xong mới bắt đầu build ứng dụng
var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

app.UseDefaultFiles();
app.MapStaticAssets();

// Kích hoạt CORS - PHẢI ĐẶT TRƯỚC Authentication/Authorization
app.UseCors("AllowReactApp");
app.MapHub<NotificationHub>("/notificationHub");

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
    
}

app.UseHttpsRedirection();

// Thứ tự middleware
app.UseAuthentication(); // 1. Kiểm tra danh tính (Token có hợp lệ không ?)
app.UseAuthorization(); // 2. Kiểm tra quyền hạn (Người dùng này được làm gì ?)

// Dashboard hangfire
app.UseHangfireDashboard("/hangfire");
app.UseHangfireJobs(); // Đăng ký các recurring job với Hangfire

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();

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
