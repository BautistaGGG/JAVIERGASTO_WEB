param(
  [string]$TaskName = "JavierGasto-DB-Backup",
  [string]$Time = "03:00"
)

$projectDir = Split-Path -Parent $PSScriptRoot
$command = "cmd /c cd /d `"$projectDir`" && npm run backup-db"

schtasks /Create /TN $TaskName /TR $command /SC DAILY /ST $Time /F | Out-Null
Write-Output "Scheduled task '$TaskName' created at $Time"
