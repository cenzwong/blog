import { defineConfig } from 'vite';

const base = `${(process.env.VITE_BASE || '/blog/').replace(/\/+$/, '')}/`;

export default defineConfig({ base });
