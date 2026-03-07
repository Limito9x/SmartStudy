using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class Contribution : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Routines_Goals_GoalId",
                table: "Routines");

            migrationBuilder.DropForeignKey(
                name: "FK_Routines_Grades_GradeId",
                table: "Routines");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Goals_GoalId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Grades_GradeId",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_GoalId",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_GradeId",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Routines_GoalId",
                table: "Routines");

            migrationBuilder.DropIndex(
                name: "IX_Routines_GradeId",
                table: "Routines");

            migrationBuilder.DropColumn(
                name: "GoalId",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "GradeId",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "GoalId",
                table: "Routines");

            migrationBuilder.DropColumn(
                name: "GradeId",
                table: "Routines");

            migrationBuilder.DropColumn(
                name: "GoalContributionValue",
                table: "Logs");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Goals");

            migrationBuilder.RenameColumn(
                name: "Artifats",
                table: "Logs",
                newName: "Artifacts");

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Grades",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Courses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ContributionRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TargetType = table.Column<int>(type: "integer", nullable: false),
                    TargetId = table.Column<int>(type: "integer", nullable: false),
                    SourceType = table.Column<int>(type: "integer", nullable: false),
                    SourceID = table.Column<int>(type: "integer", nullable: false),
                    Strategy = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
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
                    Value = table.Column<decimal>(type: "numeric", nullable: true),
                    ContributionRuleId = table.Column<int>(type: "integer", nullable: false),
                    LogId = table.Column<int>(type: "integer", nullable: false),
                    TargetType = table.Column<int>(type: "integer", nullable: false),
                    TargetId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
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

            migrationBuilder.CreateIndex(
                name: "IX_ContributionValues_ContributionRuleId",
                table: "ContributionValues",
                column: "ContributionRuleId");

            migrationBuilder.CreateIndex(
                name: "IX_ContributionValues_LogId",
                table: "ContributionValues",
                column: "LogId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContributionValues");

            migrationBuilder.DropTable(
                name: "ContributionRules");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Grades");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Courses");

            migrationBuilder.RenameColumn(
                name: "Artifacts",
                table: "Logs",
                newName: "Artifats");

            migrationBuilder.AddColumn<int>(
                name: "GoalId",
                table: "Tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GradeId",
                table: "Tasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GoalId",
                table: "Routines",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GradeId",
                table: "Routines",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<float>(
                name: "GoalContributionValue",
                table: "Logs",
                type: "real",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Goals",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_GoalId",
                table: "Tasks",
                column: "GoalId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_GradeId",
                table: "Tasks",
                column: "GradeId");

            migrationBuilder.CreateIndex(
                name: "IX_Routines_GoalId",
                table: "Routines",
                column: "GoalId");

            migrationBuilder.CreateIndex(
                name: "IX_Routines_GradeId",
                table: "Routines",
                column: "GradeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Routines_Goals_GoalId",
                table: "Routines",
                column: "GoalId",
                principalTable: "Goals",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Routines_Grades_GradeId",
                table: "Routines",
                column: "GradeId",
                principalTable: "Grades",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Goals_GoalId",
                table: "Tasks",
                column: "GoalId",
                principalTable: "Goals",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Grades_GradeId",
                table: "Tasks",
                column: "GradeId",
                principalTable: "Grades",
                principalColumn: "Id");
        }
    }
}
