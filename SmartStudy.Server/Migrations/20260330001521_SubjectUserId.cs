using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class SubjectUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Subjects_AspNetUsers_UserId",
                table: "Subjects");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "Subjects",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "AcademicTerms",
                keyColumn: "Id",
                keyValue: 1,
                column: "TermNumber",
                value: 1);

            migrationBuilder.UpdateData(
                table: "AcademicTerms",
                keyColumn: "Id",
                keyValue: 2,
                column: "TermNumber",
                value: 2);

            migrationBuilder.UpdateData(
                table: "AcademicTerms",
                keyColumn: "Id",
                keyValue: 3,
                column: "TermNumber",
                value: 3);

            migrationBuilder.AddForeignKey(
                name: "FK_Subjects_AspNetUsers_UserId",
                table: "Subjects",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Subjects_AspNetUsers_UserId",
                table: "Subjects");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "Subjects",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.UpdateData(
                table: "AcademicTerms",
                keyColumn: "Id",
                keyValue: 1,
                column: "TermNumber",
                value: 0);

            migrationBuilder.UpdateData(
                table: "AcademicTerms",
                keyColumn: "Id",
                keyValue: 2,
                column: "TermNumber",
                value: 0);

            migrationBuilder.UpdateData(
                table: "AcademicTerms",
                keyColumn: "Id",
                keyValue: 3,
                column: "TermNumber",
                value: 0);

            migrationBuilder.AddForeignKey(
                name: "FK_Subjects_AspNetUsers_UserId",
                table: "Subjects",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
