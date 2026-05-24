# OpenClaw 网络优化助手

证据优先的网络优化 Skill，用于诊断和安全配置本机网络、Clash/Mihomo 代理、DNS、WinHTTP、Git/npm/pnpm CLI 代理，以及 GitHub/OpenAI 连接问题。

## 核心原则

- 先只读诊断，再小步修改。
- 每个修改必须有当前值、新值、风险和回滚命令。
- 保护 Clash、Mihomo、VPN、TUN、企业网络配置。
- 不删除网络配置，不杀代理进程，不擅自改 Clash 节点和规则。
- 复测 before/after，同一批命令、同一批域名、同一条路径。

## 典型场景

- 浏览器能访问外网，但 Git、npm、pnpm、OpenAI SDK 失败。
- Clash 代理端口为 `7897`，需要让 CLI 工具走代理。
- DNS 首次查询慢，想做公共 DNS A/B 测试。
- Windows 系统服务需要 WinHTTP 代理。
- GitHub/OpenAI 直连不可用，需要判断直连、系统代理、CLI 代理、TUN 哪条链路在工作。

## 快速使用

输出完整流程：

```typescript
await main(ctx, { action: 'workflow', proxyPort: 7897 });
```

输出 Windows 只读快照命令：

```typescript
await main(ctx, { action: 'snapshot_windows', proxyPort: 7897 });
```

输出 Clash CLI 代理配置命令：

```typescript
await main(ctx, { action: 'configure_clash_cli', proxyPort: 7897 });
```

输出回滚命令：

```typescript
await main(ctx, { action: 'rollback_clash_cli' });
```

输出 DNS A/B 测试命令：

```typescript
await main(ctx, { action: 'dns_ab_test', interfaceAlias: 'WLAN' });
```

## Windows 快照脚本

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\windows-network-snapshot.ps1 -ProxyPort 7897
```

脚本只读输出：

- 网卡、IP、DNS、默认路由。
- Windows 用户代理、WinHTTP 代理。
- Clash/Mihomo 端口监听进程。
- 网关 ping、公网 ping。
- DNS timing。
- 直连 HTTP timing 和代理 HTTP timing。
- Git/npm/pnpm 代理配置。

## 发布结构

```text
openclaw-network-optimizer/
├── SKILL.md
├── skill.json
├── package.json
├── src/
├── dist/
├── scripts/
├── references/
└── tests/
```

## 测试

```bash
npm test
```

## 许可证

MIT
