using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Interfaces;
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
        public DbSet<Semester> Semesters { get; set; } = null!;
        public DbSet<TaskItem> Tasks { get; set; } = null!;
        public DbSet<Asset> Assets { get; set; } = null!;
        public DbSet<AssetLink> AssetLinks { get; set; } = null!;
        public DbSet<Goal> Goals { get; set; } = null!;
        public DbSet<Course> Courses { get; set; } = null!;
        public DbSet<Grade> Grades { get; set; } = null!; 
        public DbSet<LearningPath> LearningPaths { get; set; } = null!;
        public DbSet<Routine> Routines { get; set; } = null!;
        public DbSet<Schedule> Schedules { get; set; } = null!;
        public DbSet<LogItem> Logs { get; set; } = null!;
        public DbSet<ChatSession> ChatSessions { get; set; } = null!;
        public DbSet<ChatMessage> ChatMessages { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

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
            UpdateAuditableEntities();
            UpdateSoftDeletableEntities();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateAuditableEntities();
            UpdateSoftDeletableEntities();
            return await base.SaveChangesAsync(cancellationToken);
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
    }
}
