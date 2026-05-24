param(
  [int]$ProxyPort = 7897,
  [string[]]$Domains = @('chatgpt.com', 'api.openai.com', 'github.com', 'www.baidu.com', 'www.apple.com.cn')
)

$ErrorActionPreference = 'Continue'

function Section($Name) {
  Write-Output ""
  Write-Output "## $Name"
}

function Run($Label, [scriptblock]$Command) {
  Write-Output ""
  Write-Output '```powershell'
  Write-Output "# $Label"
  try {
    & $Command | Out-String | Write-Output
  } catch {
    Write-Output "ERROR: $($_.Exception.Message)"
  }
  Write-Output '```'
}

Write-Output "# Windows Network Snapshot"
Write-Output "- Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')"
Write-Output "- ProxyPort: $ProxyPort"

Section "System"
Run "OS and PowerShell" {
  [PSCustomObject]@{
    OS = [System.Environment]::OSVersion.VersionString
    PowerShell = $PSVersionTable.PSVersion.ToString()
    Machine = $env:COMPUTERNAME
    User = $env:USERNAME
  }
}

Section "Adapters"
Run "Get-NetAdapter" {
  Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, LinkSpeed, MacAddress | Format-Table -AutoSize
}

Section "IP Configuration"
Run "Get-NetIPConfiguration" {
  Get-NetIPConfiguration | Format-List
}

Section "DNS"
Run "Get-DnsClientServerAddress" {
  Get-DnsClientServerAddress -AddressFamily IPv4 | Format-Table -AutoSize
}

Section "Proxy"
Run "User proxy" {
  Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' |
    Select-Object ProxyEnable, ProxyServer, AutoConfigURL | Format-List
}
Run "WinHTTP proxy" {
  netsh winhttp show proxy
}
Run "Proxy listener" {
  Get-NetTCPConnection -LocalPort $ProxyPort -State Listen -ErrorAction SilentlyContinue |
    Select-Object LocalAddress, LocalPort, State, OwningProcess |
    ForEach-Object {
      $p = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
      [PSCustomObject]@{
        LocalAddress=$_.LocalAddress
        LocalPort=$_.LocalPort
        State=$_.State
        PID=$_.OwningProcess
        ProcessName=$p.ProcessName
        Path=$p.Path
      }
    } | Format-List
}

Section "Routes"
Run "Default route" {
  Get-NetRoute -DestinationPrefix '0.0.0.0/0' | Sort-Object RouteMetric,InterfaceMetric | Format-Table -AutoSize
}
Run "IPv4 interface metrics" {
  Get-NetIPInterface -AddressFamily IPv4 | Sort-Object InterfaceMetric | Format-Table -AutoSize
}

Section "Ping"
$gateway = (Get-NetRoute -DestinationPrefix '0.0.0.0/0' | Sort-Object RouteMetric,InterfaceMetric | Select-Object -First 1).NextHop
if ($gateway) {
  Run "Ping gateway $gateway" { ping.exe -n 20 $gateway }
} else {
  Write-Output "No default gateway detected."
}
Run "Ping 223.5.5.5" { ping.exe -n 10 223.5.5.5 }
Run "Ping 1.1.1.1" { ping.exe -n 10 1.1.1.1 }

Section "DNS Timing"
Run "Resolve-DnsName timing" {
  $rows = @()
  foreach ($d in $Domains) {
    for ($i = 1; $i -le 3; $i++) {
      $status = 'ok'
      $elapsed = Measure-Command {
        try {
          Resolve-DnsName -Name $d -Type A -DnsOnly -ErrorAction Stop | Out-Null
        } catch {
          $status = 'fail'
        }
      }
      $rows += [PSCustomObject]@{
        Domain=$d
        Try=$i
        Status=$status
        Ms=[math]::Round($elapsed.TotalMilliseconds, 1)
      }
    }
  }
  $rows | Format-Table -AutoSize
}

Section "HTTP Timing"
Run "Direct HTTP timing" {
  foreach ($d in $Domains) {
    $url = "https://$d"
    Write-Output "# DIRECT $url"
    curl.exe -I -o NUL -s -L --noproxy '*' --max-time 12 -w "http=%{http_code} dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total}`n" $url
  }
}
Run "Proxy HTTP timing" {
  foreach ($d in $Domains) {
    $url = "https://$d"
    Write-Output "# PROXY $url"
    curl.exe -I -o NUL -s -L --proxy "http://127.0.0.1:$ProxyPort" --max-time 12 -w "http=%{http_code} dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total}`n" $url
  }
}

Section "Developer Tools"
Run "Git proxy" {
  git config --global --get http.proxy
  git config --global --get https.proxy
}
Run "npm proxy" {
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    npm config get proxy
    npm config get https-proxy
  }
}
Run "pnpm proxy" {
  if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm config get proxy
    pnpm config get https-proxy
  }
}
Run "Proxy env" {
  Get-ChildItem Env:HTTP_PROXY,Env:HTTPS_PROXY,Env:ALL_PROXY,Env:NO_PROXY -ErrorAction SilentlyContinue | Format-Table -AutoSize
}
