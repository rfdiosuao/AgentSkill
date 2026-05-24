---
id: openclaw-network-optimizer
owner_id: rfdiosuao
name: OpenClaw 网络优化助手
description: This skill should be used when the user asks to "优化网络", "配置 Clash 代理", "修复 GitHub 或 OpenAI 连接", "诊断 DNS 延迟", "设置 7897 代理端口", "网络变慢", or "输出 before/after 网络优化报告". It guides safe, evidence-first network diagnosis and reversible network changes with special protection for Clash, Mihomo, VPN, TUN, and developer CLI proxy settings.
version: 1.0.0
icon: "🌐"
author: rfdiosuao
metadata:
  clawdbot:
    emoji: "🌐"
    requires:
      bins: ["powershell", "curl"]
---

# OpenClaw 网络优化助手

执行本 Skill 时，先建立证据，再提出小步可回滚修改，最后复测同一组指标。默认只读诊断；任何 DNS、代理、路由、网卡、服务顺序、WinHTTP、系统代理或 TUN 相关修改，都必须先说明风险、回滚方式和预期效果。

## 安全边界

- 锁定目标为速度、延迟、DNS 稳定性、AI 工具连通性和开发工具连通性。
- 保护 Clash Verge、Mihomo、Clash Meta、V2Ray、Tailscale、WireGuard、OpenVPN、Surge、Shadowrocket、企业 VPN 和 TUN 设备。
- 禁止把代理、VPN、TUN、虚拟网卡当成垃圾进程清理。
- 禁止删除网络配置、VPN 配置、路由规则、防火墙规则、代理配置文件或网络位置。
- 遇到远程桌面、SSH、Tailscale、RustDesk、企业 VPN 等远程访问迹象时，先询问再做任何可能断网的修改。
- 对每个修改保存原值，并在报告中写出回滚命令。
- 复测结果不稳定时，不宣称优化成功；优先保留可证实改善的改动，回退噪声较大的改动。

## 路由模式

选择并在报告中写明一种模式：

- `execute_direct`: 只读诊断、报告生成、已明确批准的可回滚命令。
- `plan_first`: DNS 切换、系统代理修改、WinHTTP 修改、网卡指标修改、服务顺序修改、缓存刷新、Clash CLI 代理配置。
- `clarify_first`: 操作系统未知、远程连接风险不明、Clash/VPN 所属不明、用户要求改动代理节点或 TUN。

## 工作流程

### 1. 识别环境

先确认操作系统、主网络接口、默认网关、DNS、代理、路由和活跃代理进程。

Windows 优先使用 `scripts/windows-network-snapshot.ps1` 做只读快照：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\windows-network-snapshot.ps1 -ProxyPort 7897
```

若没有脚本，则手动执行同类命令：

```powershell
Get-NetAdapter
Get-NetIPConfiguration
Get-DnsClientServerAddress -AddressFamily IPv4
Get-NetRoute -DestinationPrefix '0.0.0.0/0'
netsh winhttp show proxy
Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings'
Get-NetTCPConnection -LocalPort 7897 -State Listen
```

### 2. 建立基线

记录同一时段的基线指标：

- 主接口、默认网关、DNS 服务器、系统代理、WinHTTP 代理、Clash/Mihomo 监听端口。
- 网关 ping、公网 ping、GitHub/OpenAI/国内站点 HTTP 时延。
- DNS 首次查询和二次查询耗时。
- Git、npm、pnpm、curl、Python/pip 是否读取代理。
- 是否走系统代理、CLI 环境变量代理、WinHTTP 代理或 Clash TUN。

将直连和代理路径分开测。Clash 端口常见为 `7890`、`7897`、`7899`，不要假设端口；从系统代理和监听端口确认。

### 3. 判断瓶颈

只输出 3-4 个证据最强的瓶颈：

- 本地链路问题：网关 ping 丢包、Wi-Fi 信号差、信道拥挤、驱动异常。
- DNS 问题：首次查询慢、路由器 DNS 波动、公共 DNS 明显更稳。
- 代理路径问题：直连不可用，代理可通但节点延迟高、HTTP 状态异常或规则未命中。
- CLI 代理缺失：浏览器可用，但 Git、npm、pnpm、curl、pip、OpenAI SDK 失败。
- WinHTTP 缺失：系统服务、部分 Windows 程序不走用户代理。
- Bufferbloat：带宽充足但加载时延大，优先建议路由器 SQM/CAKE/FQ-CoDel。

区分事实和假设。不要从单次 speedtest 或单个超时判断全局网络状态。

### 4. 提出修改

优先选择低风险、可回滚、局部生效的修改：

1. CLI 代理配置：适合 Git/npm/pnpm/curl/OpenAI SDK 失败但浏览器可用。
2. DNS A/B 测试：适合 DNS 首次查询慢或路由器 DNS 波动。
3. DNS 缓存刷新：适合解析结果陈旧、域名刚切换、首次连接异常。
4. WinHTTP 代理：适合 Windows 服务或特定系统组件不走用户代理。
5. 网卡接口指标：适合默认路由被虚拟网卡抢占或路由优先级异常。
6. 代理节点/规则建议：只读检查后提出建议；不要直接改 Clash 节点、规则、TUN 或配置文件。

Windows + Clash 7897 的详细命令参考 `references/windows-clash.md`。

### 5. 执行与回滚

执行前写出：

- 当前值。
- 新值。
- 影响范围。
- 风险。
- 回滚命令。

示例：配置 CLI 代理到 Clash 7897。

```powershell
$proxy = 'http://127.0.0.1:7897'
$noProxy = 'localhost,127.0.0.1,::1'
[Environment]::SetEnvironmentVariable('HTTP_PROXY', $proxy, 'User')
[Environment]::SetEnvironmentVariable('HTTPS_PROXY', $proxy, 'User')
[Environment]::SetEnvironmentVariable('ALL_PROXY', $proxy, 'User')
[Environment]::SetEnvironmentVariable('NO_PROXY', $noProxy, 'User')
git config --global http.proxy $proxy
git config --global https.proxy $proxy
npm config set proxy $proxy
npm config set https-proxy $proxy
pnpm config set proxy $proxy
pnpm config set https-proxy $proxy
```

回滚：

```powershell
git config --global --unset http.proxy
git config --global --unset https.proxy
npm config delete proxy
npm config delete https-proxy
pnpm config delete proxy
pnpm config delete https-proxy
[Environment]::SetEnvironmentVariable('HTTP_PROXY', $null, 'User')
[Environment]::SetEnvironmentVariable('HTTPS_PROXY', $null, 'User')
[Environment]::SetEnvironmentVariable('ALL_PROXY', $null, 'User')
[Environment]::SetEnvironmentVariable('NO_PROXY', $null, 'User')
```

### 6. 复测

对每个改动重复同一组命令：

- `ping` 网关和公网 IP。
- DNS 查询同一批域名。
- `curl` 同一批 URL，区分直连和代理。
- `git ls-remote`、`npm ping`、OpenAI API `/v1/models`。
- 代理监听和系统代理状态。

OpenAI API 未带 key 时，`https://api.openai.com/v1/models` 返回 `401` 通常表示链路到达 API；根路径返回 `421` 不能单独视为失败。

## 输出报告模板

```markdown
**Routing**
Mode:
Goal:
Constraints:

**Baseline**
- Path:
- Proxy:
- DNS:
- Gateway ping:
- Public ping:
- HTTP:
- CLI tools:

**Findings**
1.
2.
3.

**Actions**
- Done:
- Skipped:
- Rollback:

**After**
- Same metrics:
- Delta:

**Decision**
- Keep/revert/no change:
- Remaining risks:
- Next step:
```

## 完成标准

- 已识别并保护 Clash/VPN/TUN 状态。
- 已保存每项修改前的原值。
- 已输出 before/after 证据。
- 已给出回滚命令。
- 未删除网络配置。
- 未在未经明确授权时修改 Clash 节点、规则、TUN 或 VPN。
