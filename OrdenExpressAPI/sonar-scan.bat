@echo off
echo Cleaning solution...
dotnet clean OrdenExpressAPI.csproj

echo Running tests and collecting coverage...
dotnet test OrdenExpressAPI.Tests/OrdenExpressAPI.Tests.csproj --no-build --collect:"XPlat Code Coverage" --logger trx --results-directory ./TestResults

echo Starting SonarQube scanner...
/d:sonar.cs.opencover.reportsPaths="**/TestResults/**/coverage.opencover.xml"

echo Building project...
dotnet build OrdenExpressAPI.csproj -c Release

echo Ending SonarQube scanner...
dotnet sonarscanner end /d:sonar.login="sqp_7361d3b10896befe41090e54d0d1416d474b389e"

echo SonarQube scan completed!
pause
