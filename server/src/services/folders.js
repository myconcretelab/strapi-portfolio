"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const foldersService = ({ strapi }) => ({
    async getAllFolders() {
        const rows = await strapi.db.query('plugin::upload.folder').findMany({
            select: ['id', 'name'],
            populate: { parent: { select: ['id'] } },
            orderBy: { id: 'asc' },
        });
        return rows.map((r) => { var _a, _b; return ({ id: r.id, name: r.name, parent: (_b = (_a = r.parent) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null }); });
    },
    async buildTree() {
        const settings = await strapi.plugin('strapi-portfolio').service('settings').get();
        const folders = await this.getAllFolders();
        const byId = new Map();
        const roots = [];
        // First pass: create nodes
        folders.forEach((f) => {
            var _a;
            const active = !!((_a = settings.folderPrefs[String(f.id)]) === null || _a === void 0 ? void 0 : _a.active);
            byId.set(f.id, { id: f.id, name: f.name, parentId: f.parent, level: 1, children: [], active });
        });
        // Second pass: link and compute level
        byId.forEach((node) => {
            if (node.parentId && byId.has(node.parentId)) {
                const parent = byId.get(node.parentId);
                node.level = parent.level + 1;
                parent.children.push(node);
            }
            else {
                node.parentId = null;
                node.level = 1;
                roots.push(node);
            }
        });
        return roots;
    },
});
exports.default = foldersService;
