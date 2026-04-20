FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dev
WORKDIR /app

# Chỉ copy file dự án để cache NuGet
COPY *.csproj ./
RUN dotnet restore

# Mount code sẽ được xử lý ở docker-compose, 
# ở đây chỉ cần chuẩn bị môi trường chạy watch
EXPOSE 5037
CMD ["dotnet", "watch", "run", "--non-interactive", "--urls=http://+:5037"]