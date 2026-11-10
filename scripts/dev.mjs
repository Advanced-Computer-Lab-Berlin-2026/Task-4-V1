import { createServer } from 'vite';

// A single terminal URL; no embedded browser or automatic tab opening.
const server = await createServer({
  logLevel: 'silent',
  server: { host: '127.0.0.1', port: 5173, strictPort: false, open: false }
});
await server.listen();
const port = server.httpServer.address().port;
console.log(`http://localhost:${port}/`);
process.on('SIGINT', async () => { await server.close(); process.exit(0); });
process.on('SIGTERM', async () => { await server.close(); process.exit(0); });
