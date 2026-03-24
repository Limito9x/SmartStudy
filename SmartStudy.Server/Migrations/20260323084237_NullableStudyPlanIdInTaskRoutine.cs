using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class NullableStudyPlanIdInTaskRoutine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Routines_StudyPlans_StudyPlanId",
                table: "Routines");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_StudyPlans_StudyPlanId",
                table: "Tasks");

            migrationBuilder.AlterColumn<int>(
                name: "StudyPlanId",
                table: "Tasks",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "StudyPlanId",
                table: "Routines",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Routines_StudyPlans_StudyPlanId",
                table: "Routines",
                column: "StudyPlanId",
                principalTable: "StudyPlans",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_StudyPlans_StudyPlanId",
                table: "Tasks",
                column: "StudyPlanId",
                principalTable: "StudyPlans",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Routines_StudyPlans_StudyPlanId",
                table: "Routines");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_StudyPlans_StudyPlanId",
                table: "Tasks");

            migrationBuilder.AlterColumn<int>(
                name: "StudyPlanId",
                table: "Tasks",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "StudyPlanId",
                table: "Routines",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Routines_StudyPlans_StudyPlanId",
                table: "Routines",
                column: "StudyPlanId",
                principalTable: "StudyPlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_StudyPlans_StudyPlanId",
                table: "Tasks",
                column: "StudyPlanId",
                principalTable: "StudyPlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
