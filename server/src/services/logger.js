"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MAX_LOGS = 200;
const loggerService = ({ strapi }) => ({
    async log(level, message) {
        try {
            const settingsSvc = strapi.plugin('strapi-portfolio').service('settings');
            const settings = (await settingsSvc.get());
            const entry = { ts: new Date().toISOString(), level, message };
            const next = [...settings.logs, entry].slice(-MAX_LOGS);
            await settingsSvc.set({ logs: next });
        }
        catch (e) {
            // As a last resort, write to console to avoid breaking flows
            strapi.log[level](`[strapi-portfolio] ${message}`);
        }
    },
});
exports.default = loggerService;
