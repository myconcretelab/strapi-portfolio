import type { Core } from '@strapi/strapi';
import type { PortfolioSettings } from './settings';

const MAX_LOGS = 200;

const loggerService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async log(level: 'info' | 'warn' | 'error', message: string) {
    try {
      const settingsSvc = strapi.plugin('strapi-portfolio').service('settings') as ReturnType<
        typeof import('./settings').default
      >;
      const settings = (await settingsSvc.get()) as PortfolioSettings;
      const entry = { ts: new Date().toISOString(), level, message };
      const next = [...settings.logs, entry].slice(-MAX_LOGS);
      await settingsSvc.set({ logs: next });
    } catch (e) {
      // As a last resort, write to console to avoid breaking flows
      strapi.log[level](`[strapi-portfolio] ${message}`);
    }
  },
});

export default loggerService;

