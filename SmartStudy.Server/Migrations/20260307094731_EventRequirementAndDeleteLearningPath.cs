using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class EventRequirementAndDeleteLearningPath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Routines_Courses_CourseId",
                table: "Routines");

            migrationBuilder.DropForeignKey(
                name: "FK_Routines_LearningPaths_LearningPathId",
                table: "Routines");

            migrationBuilder.DropForeignKey(
                name: "FK_Schedules_Courses_CourseId",
                table: "Schedules");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Courses_CourseId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_LearningPaths_LearningPathId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Goals_LearningPaths_LearningPathId",
                table: "Goals");

            migrationBuilder.DropTable(
                name: "ContributionValues");

            migrationBuilder.DropTable(
                name: "ContributionRules");

            migrationBuilder.DropTable(
                name: "LearningPaths");

            migrationBuilder.DropTable(
                name: "Goals");

            migrationBuilder.DropIndex(
                name: "IX_Schedules_CourseId",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "EndAt",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "StartAt",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "CourseId",
                table: "Schedules");

            migrationBuilder.RenameColumn(
                name: "LearningPathId",
                table: "Tasks",
                newName: "ScheduleId");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_LearningPathId",
                table: "Tasks",
                newName: "IX_Tasks_ScheduleId");

            migrationBuilder.RenameColumn(
                name: "LearningPathId",
                table: "Routines",
                newName: "EventRequirementId");

            migrationBuilder.RenameIndex(
                name: "IX_Routines_LearningPathId",
                table: "Routines",
                newName: "IX_Routines_EventRequirementId");

            migrationBuilder.RenameColumn(
                name: "TimeSpent",
                table: "Logs",
                newName: "ProductivityScore");

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "TimelineEvents",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "TimelineEvents",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "TimelineEvents",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "TimelineEvents",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "CourseId",
                table: "Tasks",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DurationMinutes",
                table: "Tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EventRequirementId",
                table: "Tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Tasks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "StartTime",
                table: "Tasks",
                type: "time without time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "TaskDate",
                table: "Tasks",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Subjects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<TimeOnly>(
                name: "StartTime",
                table: "Schedules",
                type: "time without time zone",
                nullable: true,
                oldClrType: typeof(TimeOnly),
                oldType: "time without time zone");

            migrationBuilder.AlterColumn<int>(
                name: "DurationUnit",
                table: "Schedules",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "Duration",
                table: "Schedules",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "CourseId",
                table: "Routines",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ActualDurationMinutes",
                table: "Logs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<float>(
                name: "EarnedValue",
                table: "Logs",
                type: "real",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EventRequirementId",
                table: "Logs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TimerEndAt",
                table: "Logs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TimerStartAt",
                table: "Logs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EventRequirements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ExpectedValue = table.Column<float>(type: "real", nullable: false),
                    Unit = table.Column<string>(type: "text", nullable: false),
                    Strategy = table.Column<int>(type: "integer", nullable: false),
                    TimelineEventId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventRequirements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventRequirements_TimelineEvents_TimelineEventId",
                        column: x => x.TimelineEventId,
                        principalTable: "TimelineEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_EventRequirementId",
                table: "Tasks",
                column: "EventRequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_EventRequirements_TimelineEventId",
                table: "EventRequirements",
                column: "TimelineEventId");

            migrationBuilder.AddForeignKey(
                name: "FK_Routines_Courses_CourseId",
                table: "Routines",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Routines_EventRequirements_EventRequirementId",
                table: "Routines",
                column: "EventRequirementId",
                principalTable: "EventRequirements",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Courses_CourseId",
                table: "Tasks",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_EventRequirements_EventRequirementId",
                table: "Tasks",
                column: "EventRequirementId",
                principalTable: "EventRequirements",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Schedules_ScheduleId",
                table: "Tasks",
                column: "ScheduleId",
                principalTable: "Schedules",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Routines_Courses_CourseId",
                table: "Routines");

            migrationBuilder.DropForeignKey(
                name: "FK_Routines_EventRequirements_EventRequirementId",
                table: "Routines");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Courses_CourseId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_EventRequirements_EventRequirementId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Schedules_ScheduleId",
                table: "Tasks");

            migrationBuilder.DropTable(
                name: "EventRequirements");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_EventRequirementId",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "TimelineEvents");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "TimelineEvents");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "TimelineEvents");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "TimelineEvents");

            migrationBuilder.DropColumn(
                name: "DurationMinutes",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "EventRequirementId",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "TaskDate",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "ActualDurationMinutes",
                table: "Logs");

            migrationBuilder.DropColumn(
                name: "EarnedValue",
                table: "Logs");

            migrationBuilder.DropColumn(
                name: "EventRequirementId",
                table: "Logs");

            migrationBuilder.DropColumn(
                name: "TimerEndAt",
                table: "Logs");

            migrationBuilder.DropColumn(
                name: "TimerStartAt",
                table: "Logs");

            migrationBuilder.RenameColumn(
                name: "ScheduleId",
                table: "Tasks",
                newName: "LearningPathId");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_ScheduleId",
                table: "Tasks",
                newName: "IX_Tasks_LearningPathId");

            migrationBuilder.RenameColumn(
                name: "EventRequirementId",
                table: "Routines",
                newName: "LearningPathId");

            migrationBuilder.RenameIndex(
                name: "IX_Routines_EventRequirementId",
                table: "Routines",
                newName: "IX_Routines_LearningPathId");

            migrationBuilder.RenameColumn(
                name: "ProductivityScore",
                table: "Logs",
                newName: "TimeSpent");

            migrationBuilder.AlterColumn<int>(
                name: "CourseId",
                table: "Tasks",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndAt",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "Tasks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartAt",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<TimeOnly>(
                name: "StartTime",
                table: "Schedules",
                type: "time without time zone",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0),
                oldClrType: typeof(TimeOnly),
                oldType: "time without time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "DurationUnit",
                table: "Schedules",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Duration",
                table: "Schedules",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CourseId",
                table: "Schedules",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CourseId",
                table: "Routines",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateTable(
                name: "ContributionRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SourceID = table.Column<int>(type: "integer", nullable: false),
                    SourceType = table.Column<int>(type: "integer", nullable: false),
                    Strategy = table.Column<int>(type: "integer", nullable: false),
                    TargetId = table.Column<int>(type: "integer", nullable: false),
                    TargetType = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContributionRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ContributionValues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ContributionRuleId = table.Column<int>(type: "integer", nullable: false),
                    LogId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TargetId = table.Column<int>(type: "integer", nullable: false),
                    TargetType = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Value = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContributionValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContributionValues_ContributionRules_ContributionRuleId",
                        column: x => x.ContributionRuleId,
                        principalTable: "ContributionRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ContributionValues_Logs_LogId",
                        column: x => x.LogId,
                        principalTable: "Logs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Goals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LearningPathId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CurrentValue = table.Column<float>(type: "real", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    TargetValue = table.Column<float>(type: "real", nullable: false),
                    Unit = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Goals_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LearningPaths",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MainGoalId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ActualEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningPaths", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LearningPaths_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LearningPaths_Goals_MainGoalId",
                        column: x => x.MainGoalId,
                        principalTable: "Goals",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_CourseId",
                table: "Schedules",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_ContributionValues_ContributionRuleId",
                table: "ContributionValues",
                column: "ContributionRuleId");

            migrationBuilder.CreateIndex(
                name: "IX_ContributionValues_LogId",
                table: "ContributionValues",
                column: "LogId");

            migrationBuilder.CreateIndex(
                name: "IX_Goals_LearningPathId",
                table: "Goals",
                column: "LearningPathId");

            migrationBuilder.CreateIndex(
                name: "IX_Goals_UserId",
                table: "Goals",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_LearningPaths_MainGoalId",
                table: "LearningPaths",
                column: "MainGoalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LearningPaths_UserId",
                table: "LearningPaths",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Routines_Courses_CourseId",
                table: "Routines",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Routines_LearningPaths_LearningPathId",
                table: "Routines",
                column: "LearningPathId",
                principalTable: "LearningPaths",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Schedules_Courses_CourseId",
                table: "Schedules",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Courses_CourseId",
                table: "Tasks",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_LearningPaths_LearningPathId",
                table: "Tasks",
                column: "LearningPathId",
                principalTable: "LearningPaths",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Goals_LearningPaths_LearningPathId",
                table: "Goals",
                column: "LearningPathId",
                principalTable: "LearningPaths",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
