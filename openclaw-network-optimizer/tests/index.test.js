const assert = require('assert');
const { main } = require('../dist/index.js');

async function capture(args) {
  let output = '';
  await main({ reply: (message) => { output = message; } }, args);
  return output;
}

(async () => {
  const workflow = await capture({ action: 'workflow', proxyPort: 7897 });
  assert(workflow.includes('Network optimization workflow'));
  assert(workflow.includes('127.0.0.1:7897'));

  const rollback = await capture({ action: 'rollback_clash_cli' });
  assert(rollback.includes('git config --global --unset http.proxy'));

  const dns = await capture({ action: 'dns_ab_test', interfaceAlias: 'WLAN' });
  assert(dns.includes("Set-DnsClientServerAddress -InterfaceAlias 'WLAN'"));

  console.log('openclaw-network-optimizer tests passed');
})();
