$port = 8000
$prefix = "http://localhost:$port/"
$base = $PSScriptRoot
$mime = @{
  '.html' = 'text/html'; '.htm' = 'text/html'; '.css' = 'text/css'; '.js' = 'application/javascript';
  '.json' = 'application/json'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg';
  '.gif' = 'image/gif'; '.svg' = 'image/svg+xml'; '.ico' = 'image/x-icon'; '.txt' = 'text/plain'
}
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try {
  $listener.Start()
  Write-Output "Serving $base on $prefix"
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $req = $context.Request
    $path = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
    if ($path -eq '') { $path = 'index.html' }
    $file = Join-Path $base $path
    if (-not (Test-Path $file)) {
      $context.Response.StatusCode = 404
      $msg = "404 Not Found"
      $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $context.Response.Close()
      continue
    }
    $ext = [System.IO.Path]::GetExtension($file).ToLower()
    $type = $mime[$ext]
    if (-not $type) { $type = 'application/octet-stream' }
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $context.Response.ContentType = $type
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.Close()
  }
} finally {
  if ($listener -ne $null) {
    $listener.Stop()
    $listener.Close()
  }
}