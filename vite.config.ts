import vinext from 'vinext';
import {defineConfig} from 'vite';
import {randomBytes} from 'node:crypto';
import {previewAuth} from './scripts/preview-auth';

export default defineConfig(async ({command}) => {
  process.env.WRANGLER_SEND_METRICS ??= 'false';
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  const {cloudflare} = await import('@cloudflare/vite-plugin');
  const previewSecret = command === 'serve' ? randomBytes(32).toString('hex') : '';
  return {
    server: {host: '127.0.0.1'},
    plugins: [vinext(), ...(previewSecret ? [previewAuth(previewSecret)] : []),
      cloudflare({
        viteEnvironment: {name: 'rsc', childEnvironments: ['ssr']},
        inspectorPort: false,
        config: {
          name: 'aventra-web', main: './worker/index.ts',
          compatibility_date: '2026-05-22', compatibility_flags: ['nodejs_compat'],
          r2_buckets: [{binding: 'BUCKET', bucket_name: 'aventra-media'}],
          ...(previewSecret ? {vars: {IDENTITY_SHARED_SECRET: previewSecret}} : {}),
        },
      }),
    ],
  };
});
