$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$listener = [System.Net.HttpListener]::new()
$port = 3100
$prefixes = @("http://localhost:$port/", "http://+:$port/")
foreach ($prefix in $prefixes) {
  $listener.Prefixes.Add($prefix)
}

$stateFile = Join-Path $root 'state.json'
if (-not (Test-Path $stateFile)) {
  Set-Content -Path $stateFile -Value '{}' -Encoding UTF8
}

$listener.Start()
Write-Host "Server running at http://localhost:$port/"

$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | ForEach-Object { $_.IPAddress }
if ($ipAddresses) {
  Write-Host "Open from phone using: http://$($ipAddresses[0]):$port/"
}

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    $path = $request.Url.AbsolutePath

    if ($path -eq '/api/state') {
      if ($request.HttpMethod -eq 'GET') {
        $content = Get-Content -Path $stateFile -Raw -ErrorAction SilentlyContinue
        if ([string]::IsNullOrWhiteSpace($content)) { $content = '{}' }
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
        $response.StatusCode = 200
        $response.ContentType = 'application/json; charset=utf-8'
        $response.Headers['Cache-Control'] = 'no-store'
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
      } elseif ($request.HttpMethod -eq 'POST') {
        $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
        $body = $reader.ReadToEnd()
        $reader.Dispose()
        if ([string]::IsNullOrWhiteSpace($body)) { $body = '{}' }
        Set-Content -Path $stateFile -Value $body -Encoding UTF8
        $response.StatusCode = 200
        $response.ContentType = 'application/json; charset=utf-8'
        $buffer = [System.Text.Encoding]::UTF8.GetBytes('{"ok":true}')
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
      } else {
        $response.StatusCode = 405
      }
      $response.Close()
      continue
    }

    if ($path -eq '/' -or $path -eq '') {
      $path = '/index.html'
    }

    $fullPath = Join-Path $root ($path.TrimStart('/'))
    if ([System.IO.Directory]::Exists($fullPath)) {
      $fullPath = Join-Path $fullPath 'index.html'
    }

    if (-not (Test-Path $fullPath)) {
      $response.StatusCode = 404
      $body = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
      $response.ContentLength64 = $body.Length
      $response.OutputStream.Write($body, 0, $body.Length)
      $response.Close()
      continue
    }

    $extension = [System.IO.Path]::GetExtension($fullPath)
    $mime = switch ($extension) {
      '.html' { 'text/html; charset=utf-8' }
      '.css' { 'text/css; charset=utf-8' }
      '.js' { 'application/javascript; charset=utf-8' }
      '.json' { 'application/json; charset=utf-8' }
      '.png' { 'image/png' }
      '.jpg' { 'image/jpeg' }
      '.jpeg' { 'image/jpeg' }
      '.svg' { 'image/svg+xml' }
      default { 'application/octet-stream' }
    }

    $bytes = [System.IO.File]::ReadAllBytes($fullPath)
    $response.StatusCode = 200
    $response.ContentType = $mime
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.Close()
  }
  catch {
    try { $response.Close() } catch {} 
  }
}
