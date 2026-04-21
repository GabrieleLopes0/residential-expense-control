FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["ExpenseControl.API.csproj", "./"]
RUN dotnet restore "ExpenseControl.API.csproj"

COPY . .
RUN dotnet publish "ExpenseControl.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
ENTRYPOINT ["dotnet", "ExpenseControl.API.dll"]
