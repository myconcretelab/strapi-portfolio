"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bootstrap = ({ strapi }) => {
    // Subscribe to lifecycles for upload plugin (folders and files)
    strapi.db.lifecycles.subscribe({
        models: ['plugin::upload.folder'],
        async afterCreate(event) {
            var _a;
            try {
                const id = (_a = event === null || event === void 0 ? void 0 : event.result) === null || _a === void 0 ? void 0 : _a.id;
                if (!id)
                    return;
                await strapi.plugin('strapi-portfolio').service('sync').handleFolderCreated(id);
            }
            catch (e) {
                strapi.plugin('strapi-portfolio').service('logger').log('error', 'Erreur lifecycle afterCreate folder');
            }
        },
    });
    strapi.db.lifecycles.subscribe({
        models: ['plugin::upload.file'],
        async afterCreate(event) {
            var _a;
            try {
                const id = (_a = event === null || event === void 0 ? void 0 : event.result) === null || _a === void 0 ? void 0 : _a.id;
                if (!id)
                    return;
                await strapi.plugin('strapi-portfolio').service('sync').handleFileUploaded(id);
            }
            catch (e) {
                strapi.plugin('strapi-portfolio').service('logger').log('error', 'Erreur lifecycle afterCreate file');
            }
        },
    });
};
exports.default = bootstrap;
