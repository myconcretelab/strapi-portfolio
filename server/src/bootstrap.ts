import type { Core } from '@strapi/strapi';

const bootstrap = ({ strapi }: { strapi: Core.Strapi }) => {
  // Subscribe to lifecycles for upload plugin (folders and files)
  strapi.db.lifecycles.subscribe({
    models: ['plugin::upload.folder'],
    async afterCreate(event) {
      try {
        const id = event?.result?.id;
        if (!id) return;
        await (strapi.plugin('strapi-portfolio').service('sync') as any).handleFolderCreated(id);
      } catch (e) {
        (strapi.plugin('strapi-portfolio').service('logger') as any).log(
          'error',
          'Erreur lifecycle afterCreate folder'
        );
      }
    },
    async afterDelete(event) {
      try {
        const id = event?.result?.id ?? event?.params?.where?.id;
        if (!id) return;
        const settingsSvc = strapi.plugin('strapi-portfolio').service('settings') as any;
        const logger = strapi.plugin('strapi-portfolio').service('logger') as any;
        const s = await settingsSvc.get();
        const prefs = { ...s.folderPrefs };
        const key = String(id);
        if (prefs[key]?.active) {
          prefs[key] = { active: false };
          await settingsSvc.set({ folderPrefs: prefs });
          await logger.log('info', `Dossier supprimé: id=${key} → Section associée conservée, marquée inactive`);
        }
      } catch (e) {
        (strapi.plugin('strapi-portfolio').service('logger') as any).log(
          'error',
          'Erreur lifecycle afterDelete folder'
        );
      }
    },
  });

  strapi.db.lifecycles.subscribe({
    models: ['plugin::upload.file'],
    async afterCreate(event) {
      try {
        const id = event?.result?.id;
        if (!id) return;
        await (strapi.plugin('strapi-portfolio').service('sync') as any).handleFileUploaded(id);
      } catch (e) {
        (strapi.plugin('strapi-portfolio').service('logger') as any).log(
          'error',
          'Erreur lifecycle afterCreate file'
        );
      }
    },
  });
};

export default bootstrap;
