using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddingUserContext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "Semesters",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "AdmissionDate",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<float>(
                name: "ProgramLength",
                table: "AspNetUsers",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<int>(
                name: "SemestersPerYear",
                table: "AspNetUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WeeksOfSummerSemester",
                table: "AspNetUsers",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WeeksPerSemester",
                table: "AspNetUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Order",
                table: "Semesters");

            migrationBuilder.DropColumn(
                name: "AdmissionDate",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ProgramLength",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "SemestersPerYear",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "WeeksOfSummerSemester",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "WeeksPerSemester",
                table: "AspNetUsers");
        }
    }
}
