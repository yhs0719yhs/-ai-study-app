(async () => {
  for (let p = 3000; p <= 3010; p++) {
    try {
      const res = await fetch(`http://localhost:${p}/api/health`);
      if (res.ok) {
        console.log('OK', p, await res.text());
        process.exit(0);
      }
    } catch (e) {
      // ignore
    }
  }
  console.error('No health endpoint responded on 3000-3010');
  process.exit(1);
})();
