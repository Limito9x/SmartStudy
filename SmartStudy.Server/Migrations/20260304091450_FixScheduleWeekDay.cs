using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class FixScheduleWeekDay : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DaysOfWeek",
                table: "Schedules");

            migrationBuilder.AddColumn<int>(
                name: "DayOfWeek",
                table: "Schedules",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DayOfWeek",
                table: "Schedules");

            migrationBuilder.AddColumn<int[]>(
                name: "DaysOfWeek",
                table: "Schedules",
                type: "integer[]",
                nullable: true);
        }
    }
}
