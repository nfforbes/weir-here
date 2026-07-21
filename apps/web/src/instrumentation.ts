/**
 * Runs once when the Next.js Node server starts.
 * Sets public DNS early so MongoDB Atlas mongodb+srv lookups work on Windows.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dns = await import('node:dns');
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  }
}
