"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PLUGIN_NAME = 'strapi-portfolio';
const SETTINGS_KEY = 'settings';
const defaultSettings = {
    folderPrefs: {},
    folderSectionMap: {},
    levelMapping: { '1': 'api::section.section', '2': 'api::section.section', '3': 'api::oeuvre.oeuvre' },
    options: {
        autoSyncOnFolderCreate: false,
        autoSyncOnFileUpload: false,
        duplicateBehavior: 'ignore',
    },
    contentTypeConfig: {
        sectionUID: 'api::section.section',
        sectionNameField: 'title',
        sectionParentField: 'parent',
        oeuvreUID: 'api::oeuvre.oeuvre',
        oeuvreTitleField: 'title',
        oeuvreMediaField: 'media',
        oeuvreSectionRelationField: 'section',
    },
    logs: [],
};
const getStore = (strapi) => strapi.store({ type: 'plugin', name: PLUGIN_NAME });
const settingsService = ({ strapi }) => ({
    async get() {
        const store = getStore(strapi);
        const settings = (await store.get({ key: SETTINGS_KEY }));
        return settings !== null && settings !== void 0 ? settings : { ...defaultSettings };
    },
    async set(newSettings) {
        var _a, _b, _c, _d, _e, _f;
        const current = await this.get();
        const merged = {
            ...current,
            ...newSettings,
            folderPrefs: { ...current.folderPrefs, ...((_a = newSettings.folderPrefs) !== null && _a !== void 0 ? _a : {}) },
            folderSectionMap: { ...current.folderSectionMap, ...((_b = newSettings.folderSectionMap) !== null && _b !== void 0 ? _b : {}) },
            levelMapping: { ...current.levelMapping, ...((_c = newSettings.levelMapping) !== null && _c !== void 0 ? _c : {}) },
            options: { ...current.options, ...((_d = newSettings.options) !== null && _d !== void 0 ? _d : {}) },
            contentTypeConfig: { ...current.contentTypeConfig, ...((_e = newSettings.contentTypeConfig) !== null && _e !== void 0 ? _e : {}) },
            logs: (_f = newSettings.logs) !== null && _f !== void 0 ? _f : current.logs,
        };
        const store = getStore(strapi);
        await store.set({ key: SETTINGS_KEY, value: merged });
        return merged;
    },
});
exports.default = settingsService;
