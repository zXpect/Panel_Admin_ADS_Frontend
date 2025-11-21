# -----------------------------
# Script de Deploy Frontend S3 + CloudFront
# Worker Verification Admin
# -----------------------------

# CONFIGURACION
$bucket = "worker-verification-frontend"
$distributionId = "E3RUBQYV3WR6FF"  # Frontend distribution
$region = "us-east-1"

# Colores para output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

Write-Host ""
Write-Host "=======================================" -ForegroundColor $InfoColor
Write-Host "  Deploy Frontend - Worker Verification" -ForegroundColor $InfoColor
Write-Host "=======================================" -ForegroundColor $InfoColor
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] No se encuentra package.json" -ForegroundColor $ErrorColor
    Write-Host "Ejecuta este script desde el directorio del proyecto frontend." -ForegroundColor $ErrorColor
    exit 1
}

# Verificar que AWS CLI esta instalado
try {
    $awsVersion = aws --version 2>&1
    Write-Host "[OK] AWS CLI detectado: $awsVersion" -ForegroundColor $SuccessColor
} catch {
    Write-Host "[ERROR] AWS CLI no esta instalado o no esta en el PATH" -ForegroundColor $ErrorColor
    Write-Host "Instala AWS CLI desde: https://aws.amazon.com/cli/" -ForegroundColor $ErrorColor
    exit 1
}

# Verificar credenciales AWS
Write-Host ""
Write-Host "[INFO] Verificando credenciales AWS..." -ForegroundColor $InfoColor
try {
    $identity = aws sts get-caller-identity --output json 2>&1 | ConvertFrom-Json
    Write-Host "[OK] Autenticado como: $($identity.Arn)" -ForegroundColor $SuccessColor
} catch {
    Write-Host "[ERROR] No se pudo verificar la identidad AWS" -ForegroundColor $ErrorColor
    Write-Host "Ejecuta 'aws configure' para configurar tus credenciales." -ForegroundColor $ErrorColor
    exit 1
}

# Confirmacion antes de continuar
Write-Host ""
Write-Host "Configuracion del deploy:" -ForegroundColor $InfoColor
Write-Host "  Bucket S3:       $bucket" -ForegroundColor $InfoColor
Write-Host "  CloudFront ID:   $distributionId" -ForegroundColor $InfoColor
Write-Host "  Region:          $region" -ForegroundColor $InfoColor
Write-Host ""

$confirm = Read-Host "Continuar con el deploy? (s/n)"
if ($confirm -ne "s") {
    Write-Host "[CANCELADO] Deploy cancelado por el usuario." -ForegroundColor $WarningColor
    exit 0
}

# -----------------------------
# 1. BUILD DEL PROYECTO
# -----------------------------
Write-Host ""
Write-Host "[1/4] Compilando proyecto..." -ForegroundColor $InfoColor
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] El build fallo." -ForegroundColor $ErrorColor
    Write-Host "Revisa los errores de compilacion arriba." -ForegroundColor $ErrorColor
    exit 1
}

Write-Host "[OK] Build completado exitosamente" -ForegroundColor $SuccessColor

# Verificar que existe el directorio dist
if (-not (Test-Path "dist")) {
    Write-Host ""
    Write-Host "[ERROR] No se genero el directorio 'dist'" -ForegroundColor $ErrorColor
    exit 1
}

# Mostrar estadisticas del build
$distFiles = Get-ChildItem -Path "dist" -Recurse -File
$totalSize = ($distFiles | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  Archivos generados: $($distFiles.Count)" -ForegroundColor $InfoColor
Write-Host "  Tamano total: $([math]::Round($totalSize, 2)) MB" -ForegroundColor $InfoColor

# -----------------------------
# 2. SUBIR A S3
# -----------------------------
Write-Host ""
Write-Host "[2/4] Sincronizando archivos con S3..." -ForegroundColor $InfoColor

aws s3 sync dist/ "s3://$bucket" --delete --region $region --cache-control "max-age=31536000" --exclude "index.html"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Fallo la subida a S3" -ForegroundColor $ErrorColor
    Write-Host "Verifica permisos IAM y que el bucket existe." -ForegroundColor $ErrorColor
    exit 1
}

# Subir index.html sin cache para que siempre se actualice
Write-Host "  Subiendo index.html (sin cache)..." -ForegroundColor $InfoColor
aws s3 cp dist/index.html "s3://$bucket/index.html" --cache-control "no-cache, no-store, must-revalidate" --region $region

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[WARNING] Error al subir index.html" -ForegroundColor $WarningColor
}

Write-Host "[OK] Archivos sincronizados correctamente" -ForegroundColor $SuccessColor

# -----------------------------
# 3. INVALIDAR CLOUDFRONT
# -----------------------------
Write-Host ""
Write-Host "[3/4] Invalidando cache de CloudFront..." -ForegroundColor $InfoColor

$invalidation = aws cloudfront create-invalidation --distribution-id $distributionId --paths "/*" --output json 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[WARNING] Error creando invalidacion de CloudFront" -ForegroundColor $WarningColor
    Write-Host "Los cambios pueden tardar en reflejarse (hasta 24h)" -ForegroundColor $WarningColor
    Write-Host "Error: $invalidation" -ForegroundColor $WarningColor
} else {
    try {
        $invalidationObj = $invalidation | ConvertFrom-Json
        $invalidationId = $invalidationObj.Invalidation.Id
        Write-Host "[OK] Invalidacion creada: $invalidationId" -ForegroundColor $SuccessColor
        Write-Host "  Los cambios se reflejaran en 1-2 minutos." -ForegroundColor $InfoColor
    } catch {
        Write-Host "[OK] Invalidacion creada correctamente" -ForegroundColor $SuccessColor
    }
}

# -----------------------------
# 4. VERIFICACION
# -----------------------------
Write-Host ""
Write-Host "[4/4] Verificando deploy..." -ForegroundColor $InfoColor

# Obtener URL de CloudFront
try {
    $distribution = aws cloudfront get-distribution --id $distributionId --output json | ConvertFrom-Json
    $cloudfrontUrl = "https://$($distribution.Distribution.DomainName)"

    Write-Host "[OK] CloudFront URL: $cloudfrontUrl" -ForegroundColor $SuccessColor
    Write-Host ""
    Write-Host "  Puedes acceder a tu aplicacion en:" -ForegroundColor $InfoColor
    Write-Host "  $cloudfrontUrl" -ForegroundColor $SuccessColor
} catch {
    Write-Host "[WARNING] No se pudo obtener la URL de CloudFront" -ForegroundColor $WarningColor
}

# -----------------------------
# RESUMEN
# -----------------------------
Write-Host ""
Write-Host "=======================================" -ForegroundColor $SuccessColor
Write-Host "  Deploy completado exitosamente" -ForegroundColor $SuccessColor
Write-Host "=======================================" -ForegroundColor $SuccessColor
Write-Host ""

Write-Host "Resumen:" -ForegroundColor $InfoColor
Write-Host "  Build:             OK - Completado" -ForegroundColor $SuccessColor
Write-Host "  S3 Sync:           OK - $($distFiles.Count) archivos" -ForegroundColor $SuccessColor
Write-Host "  CloudFront:        OK - Cache invalidado" -ForegroundColor $SuccessColor
Write-Host "  Fecha:             $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $InfoColor
Write-Host ""

Write-Host "Proximos pasos:" -ForegroundColor $InfoColor
Write-Host "  1. Espera 1-2 minutos para que la invalidacion se complete" -ForegroundColor $InfoColor
Write-Host "  2. Abre tu navegador en modo incognito (Ctrl+Shift+N)" -ForegroundColor $InfoColor
Write-Host "  3. Accede a: https://d1895epbuimf7t.cloudfront.net" -ForegroundColor $InfoColor
Write-Host "  4. Verifica que los cambios estan aplicados" -ForegroundColor $InfoColor
Write-Host ""

# Abrir browser automaticamente (opcional)
$openBrowser = Read-Host "Abrir el sitio en el navegador? (s/n)"
if ($openBrowser -eq "s") {
    Start-Process "https://d1895epbuimf7t.cloudfront.net"
}

exit 0
