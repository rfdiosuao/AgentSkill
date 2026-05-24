type SessionContext = {
  reply?: (message: string) => Promise<void> | void;
  logger?: {
    info?: (message: string) => void;
    warn?: (message: string) => void;
    error?: (message: string) => void;
  };
};

type Args = {
  action?: string;
  proxyPort?: number | string;
  interfaceAlias?: string;
};

function port(args: Args): number {
  const parsed = Number(args.proxyPort ?? 7897);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 7897;
}

function windowsSnapshot(portNumber: number): string {
  return [
    '# Windows network snapshot',
    '',
    '```powershell',
    `powershell -ExecutionPolicy Bypass -File .\\scripts\\windows-network-snapshot.ps1 -ProxyPort ${portNumber}`,
    '```'
  ].join('\n');
}

function clashCliCommands(portNumber: number): string {
  const proxy = `http://127.0.0.1:${portNumber}`;
  return [
    '# Configure CLI tools to use Clash',
    '',
    '```powershell',
    `$proxy = '${proxy}'`,
    "$noProxy = 'localhost,127.0.0.1,::1'",
    "[Environment]::SetEnvironmentVariable('HTTP_PROXY', $proxy, 'User')",
    "[Environment]::SetEnvironmentVariable('HTTPS_PROXY', $proxy, 'User')",
    "[Environment]::SetEnvironmentVariable('ALL_PROXY', $proxy, 'User')",
    "[Environment]::SetEnvironmentVariable('NO_PROXY', $noProxy, 'User')",
    'git config --global http.proxy $proxy',
    'git config --global https.proxy $proxy',
    'npm config set proxy $proxy',
    'npm config set https-proxy $proxy',
    'pnpm config set proxy $proxy',
    'pnpm config set https-proxy $proxy',
    '```'
  ].join('\n');
}

function rollbackCliCommands(): string {
  return [
    '# Roll back CLI proxy settings',
    '',
    '```powershell',
    'git config --global --unset http.proxy',
    'git config --global --unset https.proxy',
    'npm config delete proxy',
    'npm config delete https-proxy',
    'pnpm config delete proxy',
    'pnpm config delete https-proxy',
    "[Environment]::SetEnvironmentVariable('HTTP_PROXY', $null, 'User')",
    "[Environment]::SetEnvironmentVariable('HTTPS_PROXY', $null, 'User')",
    "[Environment]::SetEnvironmentVariable('ALL_PROXY', $null, 'User')",
    "[Environment]::SetEnvironmentVariable('NO_PROXY', $null, 'User')",
    '```'
  ].join('\n');
}

function dnsAbTest(interfaceAlias: string): string {
  return [
    '# DNS A/B test',
    '',
    'Save current DNS first, then test public DNS only if lookup timing supports it.',
    '',
    '```powershell',
    `Get-DnsClientServerAddress -InterfaceAlias '${interfaceAlias}' -AddressFamily IPv4`,
    `Set-DnsClientServerAddress -InterfaceAlias '${interfaceAlias}' -ServerAddresses ('223.5.5.5','119.29.29.29')`,
    'Clear-DnsClientCache',
    "Resolve-DnsName github.com -Type A -DnsOnly",
    '```',
    '',
    'Rollback to DHCP:',
    '',
    '```powershell',
    `Set-DnsClientServerAddress -InterfaceAlias '${interfaceAlias}' -ResetServerAddresses`,
    'Clear-DnsClientCache',
    '```'
  ].join('\n');
}

function workflow(portNumber: number): string {
  return [
    '# Network optimization workflow',
    '',
    '1. Identify OS, active adapter, default gateway, DNS, user proxy, WinHTTP proxy, and Clash/Mihomo listener.',
    '2. Record baseline: gateway ping, public ping, DNS timing, direct HTTP timing, proxy HTTP timing, Git/npm/OpenAI checks.',
    '3. Diagnose only evidence-backed bottlenecks: local link, DNS, proxy path, CLI proxy, WinHTTP, route metric, bufferbloat.',
    '4. Propose one reversible change at a time with current value, new value, risk, and rollback.',
    '5. Re-run the same baseline checks after each change.',
    '6. Keep only changes that clearly improve the same metric set.',
    '',
    windowsSnapshot(portNumber),
    '',
    clashCliCommands(portNumber),
    '',
    rollbackCliCommands()
  ].join('\n');
}

export async function main(ctx: SessionContext, args: Args = {}): Promise<void> {
  const action = args.action ?? 'workflow';
  const proxyPort = port(args);
  const interfaceAlias = args.interfaceAlias ?? 'WLAN';

  const outputs: Record<string, string> = {
    workflow: workflow(proxyPort),
    snapshot_windows: windowsSnapshot(proxyPort),
    configure_clash_cli: clashCliCommands(proxyPort),
    rollback_clash_cli: rollbackCliCommands(),
    dns_ab_test: dnsAbTest(interfaceAlias)
  };

  const message = outputs[action] ?? [
    `Unknown action: ${action}`,
    '',
    'Supported actions: workflow, snapshot_windows, configure_clash_cli, rollback_clash_cli, dns_ab_test'
  ].join('\n');

  if (ctx.reply) {
    await ctx.reply(message);
    return;
  }

  ctx.logger?.info?.(message);
}

export default main;
