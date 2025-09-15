"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syncService = ({ strapi }) => ({
    async syncAllActiveFolders() {
        const settingsSvc = strapi.plugin('strapi-portfolio').service('settings');
        const foldersSvc = strapi.plugin('strapi-portfolio').service('folders');
        const logger = strapi.plugin('strapi-portfolio').service('logger');
        const settings = await settingsSvc.get();
        const tree = await foldersSvc.buildTree();
        const sectionUID = settings.contentTypeConfig.sectionUID;
        const sectionNameField = settings.contentTypeConfig.sectionNameField;
        const sectionParentField = settings.contentTypeConfig.sectionParentField;
        const ensureSectionForFolder = async (node, parentSectionId) => {
            var _a;
            const levelUID = settings.levelMapping[String(node.level)];
            const isSectionLevel = levelUID === sectionUID;
            let createdSectionId = parentSectionId;
            if (node.active && isSectionLevel) {
                const existingId = (_a = settings.folderSectionMap[String(node.id)]) !== null && _a !== void 0 ? _a : null;
                if (existingId) {
                    // Update if needed (name or parent change)
                    try {
                        await strapi.entityService.update(sectionUID, existingId, {
                            data: {
                                [sectionNameField]: node.name,
                                ...(parentSectionId ? { [sectionParentField]: parentSectionId } : { [sectionParentField]: null }),
                            },
                        });
                        createdSectionId = existingId;
                    }
                    catch (e) {
                        await logger.log('warn', `Update failed for Section folderId=${node.id}, entryId=${existingId}`);
                    }
                }
                else {
                    try {
                        const created = await strapi.entityService.create(sectionUID, {
                            data: {
                                [sectionNameField]: node.name,
                                ...(parentSectionId ? { [sectionParentField]: parentSectionId } : {}),
                                publishedAt: new Date(),
                            },
                        });
                        createdSectionId = created.id;
                        // Persist link
                        const nextMap = {
                            ...settings.folderSectionMap,
                            [String(node.id)]: String(created.id),
                        };
                        await settingsSvc.set({ folderSectionMap: nextMap });
                        await logger.log('info', `Création Section ${node.name}, ID=${created.id}`);
                    }
                    catch (e) {
                        await logger.log('error', `Création Section échouée pour "${node.name}" (folderId=${node.id})`);
                    }
                }
            }
            // Recurse children
            for (const child of node.children) {
                await ensureSectionForFolder(child, createdSectionId);
            }
        };
        // Traverse all roots
        for (const root of tree) {
            await ensureSectionForFolder(root, null);
        }
    },
    async handleFolderCreated(folderId) {
        const settings = await strapi.plugin('strapi-portfolio').service('settings').get();
        if (!settings.options.autoSyncOnFolderCreate)
            return;
        // Mark new folder active by default? Keep inactive unless user enables.
        // Just trigger a sync pass; per-folder activation governs creation.
        await strapi.plugin('strapi-portfolio').service('sync').syncAllActiveFolders();
    },
    async handleFileUploaded(fileId) {
        var _a;
        const settingsSvc = strapi.plugin('strapi-portfolio').service('settings');
        const logger = strapi.plugin('strapi-portfolio').service('logger');
        const settings = await settingsSvc.get();
        if (!settings.options.autoSyncOnFileUpload)
            return;
        const oeuvreUID = settings.contentTypeConfig.oeuvreUID;
        const oeuvreTitleField = settings.contentTypeConfig.oeuvreTitleField;
        const oeuvreMediaField = settings.contentTypeConfig.oeuvreMediaField;
        const oeuvreSectionRelationField = settings.contentTypeConfig.oeuvreSectionRelationField;
        // Fetch the file and its folder
        const file = await strapi.db.query('plugin::upload.file').findOne({
            where: { id: fileId },
            populate: { folder: { select: ['id', 'name'], populate: { parent: { select: ['id'] } } } },
        });
        if (!file)
            return;
        const folder = file.folder;
        if (!folder)
            return;
        const active = !!((_a = settings.folderPrefs[String(folder.id)]) === null || _a === void 0 ? void 0 : _a.active);
        if (!active)
            return;
        // Resolve nearest ancestor Section mapping
        const resolveSectionForFolder = async (f) => {
            // If this folder has a section entry, use it
            const mapped = settings.folderSectionMap[String(f.id)];
            if (mapped)
                return mapped;
            if (!f.parent)
                return null;
            const parent = await strapi.db.query('plugin::upload.folder').findOne({
                where: { id: f.parent.id },
                populate: { parent: { select: ['id'] } },
                select: ['id', 'name'],
            });
            if (!parent)
                return null;
            return resolveSectionForFolder({ id: parent.id, parent: parent.parent });
        };
        const sectionId = await resolveSectionForFolder(folder);
        try {
            const titleBase = file.name.replace(/\.[^/.]+$/, '');
            const created = await strapi.entityService.create(oeuvreUID, {
                data: {
                    [oeuvreTitleField]: titleBase,
                    [oeuvreSectionRelationField]: sectionId !== null && sectionId !== void 0 ? sectionId : undefined,
                    // Attempt to attach media if this field exists; if not, it may fail and be caught below
                    [oeuvreMediaField]: file.id,
                    publishedAt: new Date(),
                },
            });
            await logger.log('info', `Création Oeuvre "${titleBase}", ID=${created.id} (file=${file.id})`);
        }
        catch (e) {
            await logger.log('warn', `Création Oeuvre échouée pour le fichier ${file.id} (${file.name})`);
        }
    },
});
exports.default = syncService;
