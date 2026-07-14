export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // API endpoint for state sync
    if (path === '/api/state') {
      if (request.method === 'GET') {
        const state = await TALKHIVE_STATE.get('appState');
        return new Response(state || '{}', {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        });
      }
      if (request.method === 'POST') {
        const body = await request.text();
        await TALKHIVE_STATE.put('appState', body);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Serve static files
    const staticFiles = {
      '/': { file: 'index.html', type: 'text/html; charset=utf-8' },
      '/index.html': { file: 'index.html', type: 'text/html; charset=utf-8' },
      '/styles.css': { file: 'styles.css', type: 'text/css; charset=utf-8' },
      '/script.js': { file: 'script.js', type: 'application/javascript; charset=utf-8' },
      '/state.json': { file: 'state.json', type: 'application/json; charset=utf-8' }
    };

    if (path in staticFiles) {
      const config = staticFiles[path];
      const file = await TALKHIVE_FILES.get(config.file);
      if (file) {
        return new Response(file, {
          headers: { 'Content-Type': config.type }
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
