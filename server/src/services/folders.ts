import type { Core } from '@strapi/strapi';

export type FolderNode = {
  id: number;
  name: string;
  parentId: number | null;
  level: number;
  children: FolderNode[];
  active: boolean;
};

const foldersService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getAllFolders(): Promise<Array<{ id: number; name: string; parent: number | null }>> {
    const rows = await strapi.db.query('plugin::upload.folder').findMany({
      select: ['id', 'name'],
      populate: { parent: { select: ['id'] } },
      orderBy: { id: 'asc' },
    });
    return rows.map((r: any) => ({ id: r.id, name: r.name, parent: r.parent?.id ?? null }));
  },

  async buildTree(): Promise<FolderNode[]> {
    const settings = await (strapi.plugin('strapi-portfolio').service('settings') as any).get();
    const folders = await this.getAllFolders();
    const byId = new Map<number, FolderNode>();
    const roots: FolderNode[] = [];

    // First pass: create nodes
    folders.forEach((f) => {
      const active = !!settings.folderPrefs[String(f.id)]?.active;
      byId.set(f.id, { id: f.id, name: f.name, parentId: f.parent, level: 1, children: [], active });
    });

    // Second pass: link and compute level
    byId.forEach((node) => {
      if (node.parentId && byId.has(node.parentId)) {
        const parent = byId.get(node.parentId)!;
        node.level = parent.level + 1;
        parent.children.push(node);
      } else {
        node.parentId = null;
        node.level = 1;
        roots.push(node);
      }
    });

    return roots;
  },
});

export default foldersService;

