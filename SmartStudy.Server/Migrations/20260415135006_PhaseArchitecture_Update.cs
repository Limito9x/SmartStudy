using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class PhaseArchitecture_Update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_phase_courses_course_id",
                table: "phase");

            migrationBuilder.DropForeignKey(
                name: "fk_routines_phase_phase_id",
                table: "routines");

            migrationBuilder.DropForeignKey(
                name: "fk_tasks_phase_phase_id",
                table: "tasks");

            migrationBuilder.DropPrimaryKey(
                name: "pk_phase",
                table: "phase");

            migrationBuilder.RenameTable(
                name: "phase",
                newName: "phases");

            migrationBuilder.RenameIndex(
                name: "ix_phase_course_id",
                table: "phases",
                newName: "ix_phases_course_id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_phases",
                table: "phases",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_phases_courses_course_id",
                table: "phases",
                column: "course_id",
                principalTable: "courses",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_routines_phases_phase_id",
                table: "routines",
                column: "phase_id",
                principalTable: "phases",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_tasks_phases_phase_id",
                table: "tasks",
                column: "phase_id",
                principalTable: "phases",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_phases_courses_course_id",
                table: "phases");

            migrationBuilder.DropForeignKey(
                name: "fk_routines_phases_phase_id",
                table: "routines");

            migrationBuilder.DropForeignKey(
                name: "fk_tasks_phases_phase_id",
                table: "tasks");

            migrationBuilder.DropPrimaryKey(
                name: "pk_phases",
                table: "phases");

            migrationBuilder.RenameTable(
                name: "phases",
                newName: "phase");

            migrationBuilder.RenameIndex(
                name: "ix_phases_course_id",
                table: "phase",
                newName: "ix_phase_course_id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_phase",
                table: "phase",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_phase_courses_course_id",
                table: "phase",
                column: "course_id",
                principalTable: "courses",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_routines_phase_phase_id",
                table: "routines",
                column: "phase_id",
                principalTable: "phase",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_tasks_phase_phase_id",
                table: "tasks",
                column: "phase_id",
                principalTable: "phase",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
