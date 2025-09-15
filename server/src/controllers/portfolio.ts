import type { Core } from '@strapi/strapi';

const portfolioController = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getFoldersTree(ctx) {
    const tree = await (strapi.plugin('strapi-portfolio').service('folders') as any).buildTree();
    ctx.body = tree;
  },

  async getSettings(ctx) {
    const settings = await (strapi.plugin('strapi-portfolio').service('settings') as any).get();
    ctx.body = settings;
  },

  async updateSettings(ctx) {
    const payload = ctx.request.body ?? {};
    const settings = await (strapi.plugin('strapi-portfolio').service('settings') as any).set(payload);
    ctx.body = settings;
  },

  async resync(ctx) {
    await (strapi.plugin('strapi-portfolio').service('sync') as any).syncAllActiveFolders();
    ctx.body = { ok: true };
  },

  async getLogs(ctx) {
    const settings = await (strapi.plugin('strapi-portfolio').service('settings') as any).get();
    ctx.body = settings.logs ?? [];
  },
});

export default portfolioController;

