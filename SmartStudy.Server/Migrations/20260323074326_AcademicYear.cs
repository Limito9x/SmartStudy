using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SmartStudy.Server.Migrations
{
    /// <inheritdoc />
    public partial class AcademicYear : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "AcademicYears",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.InsertData(
                table: "AcademicTerms",
                columns: new[] { "Id", "Name", "TermNumber" },
                values: new object[,]
                {
                    { 1, "Học kỳ I", 0 },
                    { 2, "Học kỳ II", 0 },
                    { 3, "Học kỳ III", 0 }
                });

            migrationBuilder.InsertData(
                table: "AcademicYears",
                columns: new[] { "Id", "EndYear", "Name", "StartYear" },
                values: new object[,]
                {
                    { 2010, 2011, "Niên khóa 2010 - 2011", 2010 },
                    { 2011, 2012, "Niên khóa 2011 - 2012", 2011 },
                    { 2012, 2013, "Niên khóa 2012 - 2013", 2012 },
                    { 2013, 2014, "Niên khóa 2013 - 2014", 2013 },
                    { 2014, 2015, "Niên khóa 2014 - 2015", 2014 },
                    { 2015, 2016, "Niên khóa 2015 - 2016", 2015 },
                    { 2016, 2017, "Niên khóa 2016 - 2017", 2016 },
                    { 2017, 2018, "Niên khóa 2017 - 2018", 2017 },
                    { 2018, 2019, "Niên khóa 2018 - 2019", 2018 },
                    { 2019, 2020, "Niên khóa 2019 - 2020", 2019 },
                    { 2020, 2021, "Niên khóa 2020 - 2021", 2020 },
                    { 2021, 2022, "Niên khóa 2021 - 2022", 2021 },
                    { 2022, 2023, "Niên khóa 2022 - 2023", 2022 },
                    { 2023, 2024, "Niên khóa 2023 - 2024", 2023 },
                    { 2024, 2025, "Niên khóa 2024 - 2025", 2024 },
                    { 2025, 2026, "Niên khóa 2025 - 2026", 2025 },
                    { 2026, 2027, "Niên khóa 2026 - 2027", 2026 },
                    { 2027, 2028, "Niên khóa 2027 - 2028", 2027 },
                    { 2028, 2029, "Niên khóa 2028 - 2029", 2028 },
                    { 2029, 2030, "Niên khóa 2029 - 2030", 2029 },
                    { 2030, 2031, "Niên khóa 2030 - 2031", 2030 },
                    { 2031, 2032, "Niên khóa 2031 - 2032", 2031 },
                    { 2032, 2033, "Niên khóa 2032 - 2033", 2032 },
                    { 2033, 2034, "Niên khóa 2033 - 2034", 2033 },
                    { 2034, 2035, "Niên khóa 2034 - 2035", 2034 },
                    { 2035, 2036, "Niên khóa 2035 - 2036", 2035 },
                    { 2036, 2037, "Niên khóa 2036 - 2037", 2036 },
                    { 2037, 2038, "Niên khóa 2037 - 2038", 2037 },
                    { 2038, 2039, "Niên khóa 2038 - 2039", 2038 },
                    { 2039, 2040, "Niên khóa 2039 - 2040", 2039 },
                    { 2040, 2041, "Niên khóa 2040 - 2041", 2040 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AcademicTerms",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "AcademicTerms",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "AcademicTerms",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2010);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2011);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2012);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2013);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2014);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2015);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2016);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2017);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2018);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2019);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2020);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2021);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2022);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2023);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2024);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2025);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2026);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2027);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2028);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2029);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2030);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2031);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2032);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2033);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2034);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2035);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2036);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2037);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2038);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2039);

            migrationBuilder.DeleteData(
                table: "AcademicYears",
                keyColumn: "Id",
                keyValue: 2040);

            migrationBuilder.DropColumn(
                name: "Name",
                table: "AcademicYears");
        }
    }
}
