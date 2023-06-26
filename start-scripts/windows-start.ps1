Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force

$message = "Starting all services"
Write-Host $message

$processes = @()

cd "..\back-end\Microservices\User_Service\"
$processes += Start-Process -FilePath "node" -ArgumentList "index.js" 

cd "..\Database_Service\"
$processes += Start-Process -FilePath "node" -ArgumentList "index.js"  

cd "..\Game_Service\"
#$processes += Start-Process -FilePath "node" -ArgumentList "index.js"  

cd "..\Web_Socket_Service\"
$processes += Start-Process -FilePath "node" -ArgumentList "index.js" 

cd "..\..\..\start-scripts"

trap {
    Write-Host "Ctrl C"
    Stop-AllProcesses
    exit
}


function Stop-AllProcesses {
    foreach ($process in $processes) {
        Stop-Process -Id $process.Id -Force
    }
}

$eventScriptBlock = {
    Stop-AllProcesses
}
$engineEvent = Register-EngineEvent -SourceIdentifier ScriptExit -Action $eventScriptBlock

Unregister-Event -SourceIdentifier ScriptExit