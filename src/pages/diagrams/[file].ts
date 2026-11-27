import type { APIRoute } from 'astro';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('.generated/diagrams');
export async function getStaticPaths() {
  return (await readdir(root)).filter(file => /^[a-f0-9]{20}-(light|dark)\.svg$/.test(file)).map(file => ({params:{file}, props:{file}}));
}
export const GET: APIRoute = async ({props}) => new Response(await readFile(path.join(root, props.file)), {headers:{'Content-Type':'image/svg+xml; charset=utf-8'}});
