using Hangfire;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Interfaces;
using SmartStudy.Server.Jobs;
using System.Linq.Expressions;

namespace SmartStudy.Server.Data

{
    public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public ApplicationDbContext()
        {
        }

        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public DbSet<Subject> Subjects { get; set; } = null!;
        public DbSet<StudyPlan> StudyPlans { get; set; } = null!;
        public DbSet<TaskItem> Tasks { get; set; } = null!;
        public DbSet<Asset> Assets { get; set; } = null!;
        public DbSet<AssetLink> AssetLinks { get; set; } = null!;
        public DbSet<Course> Courses { get; set; } = null!;
        public DbSet<Routine> Routines { get; set; } = null!;
        public DbSet<Schedule> Schedules { get; set; } = null!;
        public DbSet<LogItem> Logs { get; set; } = null!;
        public DbSet<ChatSession> ChatSessions { get; set; } = null!;
        public DbSet<ChatMessage> ChatMessages { get; set; } = null!;
        public DbSet<TimelineEvent> TimelineEvents { get; set; } = null!;
        public DbSet<StudentInfo> StudentInfos { get; set; } = null!;
        public DbSet<PlanTemplate> PlanTemplates { get; set; } = null!;
        public DbSet<AcademicTerm> AcademicTerms { get; set; } = null!;
        public DbSet<AcademicYear> AcademicYears { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.HasPostgresExtension("vector");
            base.OnModelCreating(builder);

            builder.Entity<IdentityRole<int>>().HasData(
                new IdentityRole<int> { Id = 1, Name = "Admin", NormalizedName = "ADMIN", ConcurrencyStamp = "a1b2c3d4-0001-0000-0000-000000000000" },
                new IdentityRole<int> { Id = 2, Name = "Student", NormalizedName = "STUDENT", ConcurrencyStamp = "a1b2c3d4-0002-0000-0000-000000000000" }
            );
            
            builder.Entity<AcademicTerm>().HasData(
                new AcademicTerm { Id = 1, TermNumber = 1,Name = "Học kỳ I" },
                new AcademicTerm { Id = 2, TermNumber = 2,Name = "Học kỳ II" },
                new AcademicTerm { Id = 3, TermNumber = 3,Name = "Học kỳ III" }
            );

            var years = new List<AcademicYear>();
            for (int i = 2010; i <=2040; i++)
            {
                var year = new AcademicYear()
                {
                    Id = i,
                    StartYear = i,
                    EndYear = i+1,
                    Name = $"Niên khóa {i} - {i+1}",
                };
                years.Add(year);
            }
            
            builder.Entity<AcademicYear>().HasData(years);

            // Ignore System.Threading.Tasks.Task type to avoid conflicts
            builder.Ignore<System.Threading.Tasks.Task>();

            builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                if (typeof(ISoftDeletable).IsAssignableFrom(entityType.ClrType))
                {
                    var parameter = Expression.Parameter(entityType.ClrType, "e");
                    var property = Expression.Property(parameter, nameof(ISoftDeletable.DeletedAt));
                    var condition = Expression.Equal(property, Expression.Constant(null, typeof(DateTime?)));
                    var lambda = Expression.Lambda(condition, parameter);

                    builder.Entity(entityType.ClrType).HasQueryFilter(lambda);
                }
            }

        }

        public override int SaveChanges()
        {
            NormalizeDateTimeKinds();
            UpdateAuditableEntities();
            UpdateSoftDeletableEntities();

            var syncTriggers = GatherGraphSyncTriggers();
            var result = base.SaveChanges();

            if(result>0)
            {
                DispatchGraphSyncJobs(syncTriggers);
            }

            return result;
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            NormalizeDateTimeKinds();
            UpdateAuditableEntities();
            UpdateSoftDeletableEntities();

            var syncTriggers = GatherGraphSyncTriggers();
            var result = await base.SaveChangesAsync(cancellationToken);

            if(result>0)            {
                DispatchGraphSyncJobs(syncTriggers);
            }

            return result;
        }

        private void NormalizeDateTimeKinds()
        {
            foreach (var entry in ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified))
            {
                foreach (var property in entry.Properties)
                {
                    if (property.CurrentValue is DateTime dt && dt.Kind == DateTimeKind.Unspecified)
                        property.CurrentValue = DateTime.SpecifyKind(dt, DateTimeKind.Utc);
                }
            }
        }

        private void UpdateAuditableEntities()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.Entity is IAuditable && (e.State == EntityState.Added || e.State == EntityState.Modified));
            var utcNow = DateTime.UtcNow;
            foreach (var entry in entries)
            {
                var entity = (IAuditable)entry.Entity;
                if (entry.State == EntityState.Added)
                {
                    entity.CreatedAt = utcNow;
                }
                entity.UpdatedAt = utcNow;
            }
        }

        private void UpdateSoftDeletableEntities()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.Entity is ISoftDeletable && e.State == EntityState.Deleted);
            foreach (var entry in entries)
            {
                var entity = (ISoftDeletable)entry.Entity;
                entity.DeletedAt = DateTime.UtcNow;
                entry.State = EntityState.Modified;
            }
        }

        private List<(GraphSyncScopeType Scope, int? RootId)> GatherGraphSyncTriggers()
        {
            return ChangeTracker.Entries<IGraphSyncTrigger>()
                .Where(e => e.State == EntityState.Added || 
                            e.State == EntityState.Modified || 
                            e.State == EntityState.Deleted)
                // Gom lại để loại bỏ trùng lặp (ví dụ sửa 5 cái task cùng 1 lúc thì chỉ lấy 1)
                .Select(e => new { Scope = e.Entity.GetSyncScope(), RootId = e.Entity.GetRootId() })
                .Distinct()
                .Select(x => (x.Scope, x.RootId))
                .ToList();
        }

        private void DispatchGraphSyncJobs(List<(GraphSyncScopeType Scope, int? RootId)> triggers)
        {
            if (triggers == null || !triggers.Any()) return;

            foreach (var trigger in triggers)
            {   
                if(!trigger.RootId.HasValue) continue;
                
                BackgroundJob.Enqueue<IGraphSyncBackgroundJob>(job => 
                    job.ExecuteSyncAsync(trigger.Scope, trigger.RootId.Value));
            }
        }
    }
}
