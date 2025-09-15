import type { Core } from '@strapi/strapi';

export type PortfolioSettings = {
  // Per-folder preferences (active flag)
  folderPrefs: Record<string, { active: boolean }>; // key: folderId as string
  // Map upload folderId -> created entry id for section type
  folderSectionMap: Record<string, string>; // key: folderId as string, value: section entry id (stringified)
  // Level -> content type UID mapping (e.g., 1: 'api::section.section')
  levelMapping: Record<string, string>; // level as string key for simplicity
  // Global options
  options: {
    autoSyncOnFolderCreate: boolean;
    autoSyncOnFileUpload: boolean;
    duplicateBehavior: 'overwrite' | 'ignore' | 'create';
  };
  // Content-type field configuration (to avoid guessing)
  contentTypeConfig: {
    sectionUID: string; // default 'api::section.section'
    sectionNameField: string; // default 'title'
    sectionParentField: string; // default 'parent'
    oeuvreUID: string; // default 'api::oeuvre.oeuvre'
    oeuvreTitleField: string; // default 'title'
    oeuvreMediaField: string; // default 'media'
    oeuvreSectionRelationField: string; // default 'section'
  };
  // Recent logs (bounded)
  logs: Array<{ ts: string; level: 'info' | 'warn' | 'error'; message: string }>; 
};

const PLUGIN_NAME = 'strapi-portfolio';
const SETTINGS_KEY = 'settings';

const defaultSettings: PortfolioSettings = {
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

const getStore = (strapi: Core.Strapi) =>
  strapi.store({ type: 'plugin', name: PLUGIN_NAME });

const settingsService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async get(): Promise<PortfolioSettings> {
    const store = getStore(strapi);
    const settings = (await store.get({ key: SETTINGS_KEY })) as PortfolioSettings | null;
    return settings ?? { ...defaultSettings };
  },

  async set(newSettings: Partial<PortfolioSettings>): Promise<PortfolioSettings> {
    const current = await this.get();
    const merged: PortfolioSettings = {
      ...current,
      ...newSettings,
      folderPrefs: { ...current.folderPrefs, ...(newSettings.folderPrefs ?? {}) },
      folderSectionMap: { ...current.folderSectionMap, ...(newSettings.folderSectionMap ?? {}) },
      levelMapping: { ...current.levelMapping, ...(newSettings.levelMapping ?? {}) },
      options: { ...current.options, ...(newSettings.options ?? {}) },
      contentTypeConfig: { ...current.contentTypeConfig, ...(newSettings.contentTypeConfig ?? {}) },
      logs: newSettings.logs ?? current.logs,
    };
    const store = getStore(strapi);
    await store.set({ key: SETTINGS_KEY, value: merged });
    return merged;
  },
});

export default settingsService;
