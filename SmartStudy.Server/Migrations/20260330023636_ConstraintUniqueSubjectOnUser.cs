using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class ConstraintUniqueSubjectOnUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Subjects_Name",
                table: "Subjects");

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "PlanTemplates",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_Name_Type_UserId",
                table: "Subjects",
                columns: new[] { "Name", "Type", "UserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Subjects_Name_Type_UserId",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "PlanTemplates");

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_Name",
                table: "Subjects",
                column: "Name",
                unique: true);
        }
    }
}
