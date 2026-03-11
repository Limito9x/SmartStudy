using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class CourseMentorAndAlternativeName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AlternativeName",
                table: "Routines");

            migrationBuilder.DropColumn(
                name: "Mentor",
                table: "Routines");

            migrationBuilder.AddColumn<string>(
                name: "AlternativeName",
                table: "Courses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Mentor",
                table: "Courses",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AlternativeName",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "Mentor",
                table: "Courses");

            migrationBuilder.AddColumn<string>(
                name: "AlternativeName",
                table: "Routines",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Mentor",
                table: "Routines",
                type: "text",
                nullable: true);
        }
    }
}
