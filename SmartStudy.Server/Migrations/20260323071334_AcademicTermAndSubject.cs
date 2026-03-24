using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class AcademicTermAndSubject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Subjects");

            migrationBuilder.AlterColumn<int>(
                name: "Credits",
                table: "Subjects",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Subjects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TermId",
                table: "StudyPlans",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "StudyPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "YearId",
                table: "StudyPlans",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AcademicTerms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TermNumber = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
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
                    EndYear = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicYears", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_UserId",
                table: "Subjects",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudyPlans_TermId",
                table: "StudyPlans",
                column: "TermId");

            migrationBuilder.CreateIndex(
                name: "IX_StudyPlans_YearId",
                table: "StudyPlans",
                column: "YearId");

            migrationBuilder.AddForeignKey(
                name: "FK_StudyPlans_AcademicTerms_TermId",
                table: "StudyPlans",
                column: "TermId",
                principalTable: "AcademicTerms",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StudyPlans_AcademicYears_YearId",
                table: "StudyPlans",
                column: "YearId",
                principalTable: "AcademicYears",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Subjects_AspNetUsers_UserId",
                table: "Subjects",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StudyPlans_AcademicTerms_TermId",
                table: "StudyPlans");

            migrationBuilder.DropForeignKey(
                name: "FK_StudyPlans_AcademicYears_YearId",
                table: "StudyPlans");

            migrationBuilder.DropForeignKey(
                name: "FK_Subjects_AspNetUsers_UserId",
                table: "Subjects");

            migrationBuilder.DropTable(
                name: "AcademicTerms");

            migrationBuilder.DropTable(
                name: "AcademicYears");

            migrationBuilder.DropIndex(
                name: "IX_Subjects_UserId",
                table: "Subjects");

            migrationBuilder.DropIndex(
                name: "IX_StudyPlans_TermId",
                table: "StudyPlans");

            migrationBuilder.DropIndex(
                name: "IX_StudyPlans_YearId",
                table: "StudyPlans");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "TermId",
                table: "StudyPlans");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "StudyPlans");

            migrationBuilder.DropColumn(
                name: "YearId",
                table: "StudyPlans");

            migrationBuilder.AlterColumn<int>(
                name: "Credits",
                table: "Subjects",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Subjects",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
