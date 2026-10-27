import localtunnel from 'localtunnel';

const PORT = 5000;

async function startTunnel() {
  console.log(`[Tunnel] Opening persistent public tunnel on port ${PORT}...`);
  try {
    const tunnel = await localtunnel({ port: PORT });
    console.log(`===============================================`);
    console.log(`🚀 CineReserve Live Hosted Public URL:`);
    console.log(`🔗 ${tunnel.url}`);
    console.log(`===============================================`);

    tunnel.on('close', () => {
      console.log('[Tunnel] Tunnel closed. Reconnecting in 3s...');
      setTimeout(startTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('[Tunnel] Error:', err.message);
      setTimeout(startTunnel, 3000);
    });
  } catch (err) {
    console.error('[Tunnel] Failed to initialize tunnel:', err.message);
    setTimeout(startTunnel, 5000);
  }
}

startTunnel();
