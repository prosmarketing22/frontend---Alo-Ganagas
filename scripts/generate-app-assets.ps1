# Genera resources/icon.png (1024x1024), resources/splash.png (2732x2732)
# y resources/icon-foreground.png (1024x1024 con padding para icono adaptativo Android)
# a partir del logo del proyecto.
#
# Uso: powershell -ExecutionPolicy Bypass -File scripts/generate-app-assets.ps1

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
# icon-512.png ya está recortado al símbolo (sin texto). logo-cliente.png tiene texto.
$iconSrc = Join-Path $root "public\icon-512.png"
$splashSrc = Join-Path $root "src\assets\logo-cliente.png"
$out = Join-Path $root "resources"

if (!(Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }

$brandBg = [System.Drawing.Color]::White

function New-Square {
    param(
        [string]$SourcePath,
        [string]$OutPath,
        [int]$Size,
        [System.Drawing.Color]$BackgroundColor,
        [double]$ContentScale = 0.72
    )

    $src = [System.Drawing.Image]::FromFile($SourcePath)
    $canvas = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $bgBrush = New-Object System.Drawing.SolidBrush($BackgroundColor)
    $g.FillRectangle($bgBrush, 0, 0, $Size, $Size)
    $bgBrush.Dispose()

    $maxContent = [int]($Size * $ContentScale)
    $ratio = [Math]::Min($maxContent / $src.Width, $maxContent / $src.Height)
    $w = [int]($src.Width * $ratio)
    $h = [int]($src.Height * $ratio)
    $x = [int](($Size - $w) / 2)
    $y = [int](($Size - $h) / 2)

    $g.DrawImage($src, $x, $y, $w, $h)
    $g.Dispose()
    $src.Dispose()

    $canvas.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Dispose()
    Write-Host "OK: $OutPath ($Size x $Size, contenido $w x $h)"
}

# 1) Icon principal: símbolo en blanco, ocupa 75% del canvas (estilo Material You)
New-Square -SourcePath $iconSrc -OutPath (Join-Path $out "icon.png") -Size 1024 -BackgroundColor $brandBg -ContentScale 0.75

# 2) Icon foreground (adaptativo Android, padding mayor — 60% para safe zone)
New-Square -SourcePath $iconSrc -OutPath (Join-Path $out "icon-foreground.png") -Size 1024 -BackgroundColor ([System.Drawing.Color]::Transparent) -ContentScale 0.60

# 3) Icon background plano blanco para iconos adaptativos
$bg = New-Object System.Drawing.Bitmap(1024, 1024)
$bgG = [System.Drawing.Graphics]::FromImage($bg)
$brush = New-Object System.Drawing.SolidBrush($brandBg)
$bgG.FillRectangle($brush, 0, 0, 1024, 1024)
$brush.Dispose()
$bgG.Dispose()
$bg.Save((Join-Path $out "icon-background.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bg.Dispose()
Write-Host "OK: icon-background.png (1024 x 1024 blanco)"

# 4) Splash: logo con texto, 40% del canvas para que se vea bien centrado
New-Square -SourcePath $splashSrc -OutPath (Join-Path $out "splash.png") -Size 2732 -BackgroundColor $brandBg -ContentScale 0.40

# 5) Splash dark mode
New-Square -SourcePath $splashSrc -OutPath (Join-Path $out "splash-dark.png") -Size 2732 -BackgroundColor ([System.Drawing.Color]::FromArgb(15, 23, 42)) -ContentScale 0.40

Write-Host ""
Write-Host "Listo. Archivos en: $out"
