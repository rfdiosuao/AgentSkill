# Windows + Clash 网络修改参考

本参考用于 Windows 主机，尤其是 Clash Verge、Mihomo、Clash Meta 本地代理端口为 `7897` 的场景。所有命令都应在确认风险和回滚后执行。

## 只读识别

确认 Clash/Mihomo 端口：

```powershell
Get-NetTCPConnection -LocalPort 7897 -State Listen -ErrorAction SilentlyContinue |
  Select-Object LocalAddress,LocalPort,State,OwningProcess |
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
  }
```

确认用户系统代理：

```powershell
Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' |
  Select-Object ProxyEnable,ProxyServer,AutoConfigURL
```

确认 WinHTTP：

```powershell
netsh winhttp show proxy
```

确认 Git/npm/pnpm：

```powershell
git config --global --get http.proxy
git config --global --get https.proxy
npm config get proxy
npm config get https-proxy
pnpm config get proxy
pnpm config get https-proxy
```

## CLI 代理修改

适用条件：

- 浏览器能通过 Clash 访问，但 Git、npm、pnpm、curl、pip、OpenAI SDK 失败。
- Clash 已监听 `127.0.0.1:7897`。
- 用户没有要求关闭 Clash 或修改节点。

执行：

```powershell
$proxy = 'http://127.0.0.1:7897'
$noProxy = 'localhost,127.0.0.1,::1'

[Environment]::SetEnvironmentVariable('HTTP_PROXY', $proxy, 'User')
[Environment]::SetEnvironmentVariable('HTTPS_PROXY', $proxy, 'User')
[Environment]::SetEnvironmentVariable('ALL_PROXY', $proxy, 'User')
[Environment]::SetEnvironmentVariable('NO_PROXY', $noProxy, 'User')

$env:HTTP_PROXY = $proxy
$env:HTTPS_PROXY = $proxy
$env:ALL_PROXY = $proxy
$env:NO_PROXY = $noProxy

git config --global http.proxy $proxy
git config --global https.proxy $proxy

if (Get-Command npm -ErrorAction SilentlyContinue) {
  npm config set proxy $proxy
  npm config set https-proxy $proxy
}

if (Get-Command pnpm -ErrorAction SilentlyContinue) {
  pnpm config set proxy $proxy
  pnpm config set https-proxy $proxy
}
```

回滚：

```powershell
git config --global --unset http.proxy
git config --global --unset https.proxy

if (Get-Command npm -ErrorAction SilentlyContinue) {
  npm config delete proxy
  npm config delete https-proxy
}

if (Get-Command pnpm -ErrorAction SilentlyContinue) {
  pnpm config delete proxy
  pnpm config delete https-proxy
}

[Environment]::SetEnvironmentVariable('HTTP_PROXY', $null, 'User')
[Environment]::SetEnvironmentVariable('HTTPS_PROXY', $null, 'User')
[Environment]::SetEnvironmentVariable('ALL_PROXY', $null, 'User')
[Environment]::SetEnvironmentVariable('NO_PROXY', $null, 'User')
```

验证：

```powershell
curl.exe -I -o NUL -s -L --max-time 12 -w "github http=%{http_code} total=%{time_total}`n" https://github.com
git ls-remote https://github.com/rfdiosuao/AgentSkill.git HEAD
npm ping --registry=https://registry.npmjs.org/
curl.exe -s -o NUL -L --max-time 12 -w "openai_models http=%{http_code} total=%{time_total}`n" https://api.openai.com/v1/models
```

## WinHTTP 代理修改

适用条件：

- 普通浏览器和 CLI 已通。
- 某些 Windows 服务、系统组件或企业工具仍不走代理。
- 用户理解 WinHTTP 是系统级代理，不等同于浏览器代理。

执行：

```powershell
netsh winhttp set proxy 127.0.0.1:7897 bypass-list="localhost;127.0.0.1;::1"
```

或从当前用户代理导入：

```powershell
netsh winhttp import proxy source=ie
```

回滚：

```powershell
netsh winhttp reset proxy
```

## DNS A/B 测试

适用条件：

- 路由器 DNS 首次查询慢或波动大。
- 公共 DNS 对同一批域名更稳定。
- 用户接受 DNS 变化可能影响内网域名解析。

保存原值：

```powershell
Get-DnsClientServerAddress -InterfaceAlias 'WLAN' -AddressFamily IPv4
```

测试候选 DNS：

```powershell
Set-DnsClientServerAddress -InterfaceAlias 'WLAN' -ServerAddresses ('223.5.5.5','119.29.29.29')
Clear-DnsClientCache
```

回滚到 DHCP：

```powershell
Set-DnsClientServerAddress -InterfaceAlias 'WLAN' -ResetServerAddresses
Clear-DnsClientCache
```

若原值是固定 DNS，则回滚到原值：

```powershell
Set-DnsClientServerAddress -InterfaceAlias 'WLAN' -ServerAddresses ('192.168.1.1')
Clear-DnsClientCache
```

验证：

```powershell
$domains = 'chatgpt.com','api.openai.com','github.com','www.baidu.com','www.apple.com.cn'
foreach ($d in $domains) {
  $elapsed = Measure-Command { Resolve-DnsName -Name $d -Type A -DnsOnly -ErrorAction SilentlyContinue | Out-Null }
  [PSCustomObject]@{ Domain=$d; Ms=[math]::Round($elapsed.TotalMilliseconds,1) }
}
```

## 接口路由指标

适用条件：

- 默认路由被 VMware、Hyper-V、VPN、虚拟网卡或蓝牙网络错误抢占。
- `Get-NetRoute -DestinationPrefix '0.0.0.0/0'` 显示非主接口优先。

只读检查：

```powershell
Get-NetIPInterface -AddressFamily IPv4 | Sort-Object InterfaceMetric
Get-NetRoute -DestinationPrefix '0.0.0.0/0' | Sort-Object RouteMetric,InterfaceMetric
```

修改示例：

```powershell
Set-NetIPInterface -InterfaceAlias 'WLAN' -InterfaceMetric 20
Set-NetIPInterface -InterfaceAlias 'VMware Network Adapter VMnet8' -InterfaceMetric 80
Set-NetIPInterface -InterfaceAlias 'VMware Network Adapter VMnet1' -InterfaceMetric 80
```

回滚：

```powershell
Set-NetIPInterface -InterfaceAlias 'WLAN' -AutomaticMetric Enabled
Set-NetIPInterface -InterfaceAlias 'VMware Network Adapter VMnet8' -AutomaticMetric Enabled
Set-NetIPInterface -InterfaceAlias 'VMware Network Adapter VMnet1' -AutomaticMetric Enabled
```

## 不要自动做的事

- 不要杀 `verge-mihomo.exe`、`clash.exe`、`tailscale.exe`、`wireguard.exe`。
- 不要直接改 Clash 配置文件中的节点、规则、DNS hijack、TUN、route exclude。
- 不要删除 VMware、Hyper-V、VPN、TUN 网卡。
- 不要重置网络栈，除非用户明确接受断网和重启风险。
- 不要把 OpenAI 根路径 `421` 当成 API 不通；优先测 `/v1/models`。
