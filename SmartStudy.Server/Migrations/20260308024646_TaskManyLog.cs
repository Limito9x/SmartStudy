using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class TaskManyLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Logs_TaskId",
                table: "Logs");

            migrationBuilder.DropColumn(
                name: "Artifacts",
                table: "Logs");

            migrationBuilder.CreateIndex(
                name: "IX_Logs_TaskId",
                table: "Logs",
                column: "TaskId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Logs_TaskId",
                table: "Logs");

            migrationBuilder.AddColumn<string[]>(
                name: "Artifacts",
                table: "Logs",
                type: "text[]",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Logs_TaskId",
                table: "Logs",
                column: "TaskId",
                unique: true);
        }
    }
}
