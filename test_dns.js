const dns = require('dns');
const domains = Array.from({length: 60}, (_, i) => `fake-domain-${i}-abc123def.com`);

async function check() {
  const promises = domains.map(async d => {
    try {
      await dns.promises.resolveAny(d);
      return 'OK';
    } catch(e) {
      return e.code || e.message;
    }
  });
  const results = await Promise.all(promises);
  console.log(results);
}
check();
