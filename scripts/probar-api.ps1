$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000'
function Ver($titulo, $dato) {
  Write-Host "`n=== $titulo ===" -ForegroundColor Cyan
  $dato | ConvertTo-Json -Depth 8
}

Ver 'GET /health' (Invoke-RestMethod "$base/health")
Ver 'GET /api/productos (lista inicial)' (Invoke-RestMethod "$base/api/productos")
$body = @{ nombre='Martillo de prueba'; precio=58.50; stock=12; categoria='Herramientas'; activo=$true } | ConvertTo-Json
$creado = Invoke-RestMethod -Method POST -Uri "$base/api/productos" -ContentType 'application/json' -Body $body
Ver 'POST /api/productos (201)' $creado
$id = $creado.id
Ver "GET /api/productos/$id (200)" (Invoke-RestMethod "$base/api/productos/$id")
$cambio = @{ precio=55.00; stock=10 } | ConvertTo-Json
Ver "PATCH /api/productos/$id (200)" (Invoke-RestMethod -Method PATCH -Uri "$base/api/productos/$id" -ContentType 'application/json' -Body $cambio)
Invoke-RestMethod -Method DELETE -Uri "$base/api/productos/$id" | Out-Null
Write-Host "`n=== DELETE /api/productos/$id (204) ===" -ForegroundColor Cyan
Write-Host 'Eliminado correctamente.'
Write-Host "`nLas pruebas básicas terminaron." -ForegroundColor Green
