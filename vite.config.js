import { defineConfig } from 'vite';
import { exec } from 'child_process';
import path from 'path';

export default defineConfig({
  base: '/blog/',
  plugins: [
    {
      name: 'watch-content-ingest',
      configureServer(server) {
        const contentPath = path.resolve(process.cwd(), 'content');
        server.watcher.add(contentPath);

        server.watcher.on('all', (event, file) => {
          if (file.startsWith(contentPath)) {
            console.log(`\n[watcher] Content file ${event}: ${path.relative(process.cwd(), file)}`);
            console.log(`[watcher] Running content ingestion...`);
            
            exec('python3 scripts/ingest.py', (err, stdout, stderr) => {
              if (err) {
                console.error(`[watcher] Ingestion error:`, err);
                return;
              }
              if (stdout) console.log(stdout.trim());
              if (stderr) console.error(stderr.trim());
              
              console.log(`[watcher] Ingestion complete. Reloading browser...`);
              server.ws.send({
                type: 'full-reload',
                path: '*'
              });
            });
          }
        });
      }
    }
  ]
});
