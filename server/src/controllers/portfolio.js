"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const portfolioController = ({ strapi }) => ({
    async getFoldersTree(ctx) {
        const tree = await strapi.plugin('strapi-portfolio').service('folders').buildTree();
        ctx.body = tree;
    },
    async getSettings(ctx) {
        const settings = await strapi.plugin('strapi-portfolio').service('settings').get();
        ctx.body = settings;
    },
    async updateSettings(ctx) {
        var _a;
        const payload = (_a = ctx.request.body) !== null && _a !== void 0 ? _a : {};
        const settings = await strapi.plugin('strapi-portfolio').service('settings').set(payload);
        ctx.body = settings;
    },
    async resync(ctx) {
        await strapi.plugin('strapi-portfolio').service('sync').syncAllActiveFolders();
        ctx.body = { ok: true };
    },
    async getLogs(ctx) {
        var _a;
        const settings = await strapi.plugin('strapi-portfolio').service('settings').get();
        ctx.body = (_a = settings.logs) !== null && _a !== void 0 ? _a : [];
    },
});
exports.default = portfolioController;
