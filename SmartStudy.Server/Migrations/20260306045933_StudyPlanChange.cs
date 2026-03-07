using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class StudyPlanChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Courses_AspNetUsers_UserId",
                table: "Courses");

            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Semesters_SemesterId",
                table: "Courses");

            migrationBuilder.DropTable(
                name: "Grades");

            migrationBuilder.DropTable(
                name: "Semesters");

            migrationBuilder.DropIndex(
                name: "IX_Courses_SemesterId",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "ForecastGrade",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "Grades",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "SemesterId",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "TargetGrade",
                table: "Courses");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Courses",
                newName: "SubjectId");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Courses",
                newName: "StudyPlanId");

            migrationBuilder.RenameIndex(
                name: "IX_Courses_UserId",
                table: "Courses",
                newName: "IX_Courses_SubjectId");

            migrationBuilder.AddColumn<double>(
                name: "FinalScore",
                table: "Courses",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TargetScore",
                table: "Courses",
                type: "double precision",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AcademicTerms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TermValue = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicTerms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AcademicYears",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StartYear = table.Column<int>(type: "integer", nullable: false),
                    EndYear = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicYears", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Subjects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subjects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TimelineEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CourseId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimelineEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimelineEvents_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudyPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AcademicYearId = table.Column<int>(type: "integer", nullable: false),
                    AcademicTermId = table.Column<int>(type: "integer", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    IsCurrent = table.Column<bool>(type: "boolean", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudyPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudyPlans_AcademicTerms_AcademicTermId",
                        column: x => x.AcademicTermId,
                        principalTable: "AcademicTerms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudyPlans_AcademicYears_AcademicYearId",
                        column: x => x.AcademicYearId,
                        principalTable: "AcademicYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudyPlans_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "AcademicTerms",
                columns: new[] { "Id", "CreatedAt", "Name", "TermValue", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Học kỳ 1", 1, null },
                    { 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Học kỳ 2", 2, null },
                    { 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Học kỳ Hè", 3, null }
                });

            migrationBuilder.InsertData(
                table: "AcademicYears",
                columns: new[] { "Id", "CreatedAt", "EndYear", "StartYear", "UpdatedAt" },
                values: new object[,]
                {
                    { 2020, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2021, 2020, null },
                    { 2021, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2022, 2021, null },
                    { 2022, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2023, 2022, null },
                    { 2023, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2024, 2023, null },
                    { 2024, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2025, 2024, null },
                    { 2025, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2026, 2025, null },
                    { 2026, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2027, 2026, null },
                    { 2027, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2028, 2027, null },
                    { 2028, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2029, 2028, null },
                    { 2029, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2030, 2029, null },
                    { 2030, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2031, 2030, null },
                    { 2031, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2032, 2031, null },
                    { 2032, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2033, 2032, null },
                    { 2033, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2034, 2033, null },
                    { 2034, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2035, 2034, null },
                    { 2035, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2036, 2035, null },
                    { 2036, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2037, 2036, null },
                    { 2037, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2038, 2037, null },
                    { 2038, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2039, 2038, null },
                    { 2039, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2040, 2039, null },
                    { 2040, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2041, 2040, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Courses_StudyPlanId_SubjectId",
                table: "Courses",
                columns: new[] { "StudyPlanId", "SubjectId" });

            migrationBuilder.CreateIndex(
                name: "IX_AcademicTerms_TermValue",
                table: "AcademicTerms",
                column: "TermValue",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AcademicYears_StartYear_EndYear",
                table: "AcademicYears",
                columns: new[] { "StartYear", "EndYear" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudyPlans_AcademicTermId",
                table: "StudyPlans",
                column: "AcademicTermId");

            migrationBuilder.CreateIndex(
                name: "IX_StudyPlans_AcademicYearId",
                table: "StudyPlans",
                column: "AcademicYearId");

            migrationBuilder.CreateIndex(
                name: "IX_StudyPlans_UserId",
                table: "StudyPlans",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_Name",
                table: "Subjects",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TimelineEvents_CourseId_DueDate",
                table: "TimelineEvents",
                columns: new[] { "CourseId", "DueDate" });

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_StudyPlans_StudyPlanId",
                table: "Courses",
                column: "StudyPlanId",
                principalTable: "StudyPlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Subjects_SubjectId",
                table: "Courses",
                column: "SubjectId",
                principalTable: "Subjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Courses_StudyPlans_StudyPlanId",
                table: "Courses");

            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Subjects_SubjectId",
                table: "Courses");

            migrationBuilder.DropTable(
                name: "StudyPlans");

            migrationBuilder.DropTable(
                name: "Subjects");

            migrationBuilder.DropTable(
                name: "TimelineEvents");

            migrationBuilder.DropTable(
                name: "AcademicTerms");

            migrationBuilder.DropTable(
                name: "AcademicYears");

            migrationBuilder.DropIndex(
                name: "IX_Courses_StudyPlanId_SubjectId",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "FinalScore",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "TargetScore",
                table: "Courses");

            migrationBuilder.RenameColumn(
                name: "SubjectId",
                table: "Courses",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "StudyPlanId",
                table: "Courses",
                newName: "Type");

            migrationBuilder.RenameIndex(
                name: "IX_Courses_SubjectId",
                table: "Courses",
                newName: "IX_Courses_UserId");

            migrationBuilder.AddColumn<float>(
                name: "ForecastGrade",
                table: "Courses",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<ICollection<object>>(
                name: "Grades",
                table: "Courses",
                type: "jsonb",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Courses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SemesterId",
                table: "Courses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<float>(
                name: "TargetGrade",
                table: "Courses",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.CreateTable(
                name: "Grades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CourseId = table.Column<int>(type: "integer", nullable: false),
                    ActualScore = table.Column<double>(type: "double precision", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MaxScale = table.Column<double>(type: "double precision", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Weight = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Grades", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Grades_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Semesters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ActualEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActualStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CurrentGPA = table.Column<float>(type: "real", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsCurrent = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TargetGPA = table.Column<float>(type: "real", nullable: false),
                    Term = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Year = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Semesters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Semesters_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Courses_SemesterId",
                table: "Courses",
                column: "SemesterId");

            migrationBuilder.CreateIndex(
                name: "IX_Grades_CourseId",
                table: "Grades",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Semesters_UserId",
                table: "Semesters",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_AspNetUsers_UserId",
                table: "Courses",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Semesters_SemesterId",
                table: "Courses",
                column: "SemesterId",
                principalTable: "Semesters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
