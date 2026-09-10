import { defineConfig } from 'tsup';
export default defineConfig({ noExternal: ['@recall/contracts', '@recall/domain'] });
