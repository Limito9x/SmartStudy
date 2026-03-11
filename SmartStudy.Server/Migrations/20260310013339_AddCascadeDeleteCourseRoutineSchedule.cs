using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddCascadeDeleteCourseRoutineSchedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Schedules_Routines_RoutineId",
                table: "Schedules");

            migrationBuilder.AddForeignKey(
                name: "FK_Schedules_Routines_RoutineId",
                table: "Schedules",
                column: "RoutineId",
                principalTable: "Routines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Schedules_Routines_RoutineId",
                table: "Schedules");

            migrationBuilder.AddForeignKey(
                name: "FK_Schedules_Routines_RoutineId",
                table: "Schedules",
                column: "RoutineId",
                principalTable: "Routines",
                principalColumn: "Id");
        }
    }
}
