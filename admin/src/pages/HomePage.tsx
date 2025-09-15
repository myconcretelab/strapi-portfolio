import { Main, Box, Flex, Typography, Switch, Button } from '@strapi/design-system';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

type FolderNode = {
  id: number;
  name: string;
  level: number;
  parentId: number | null;
  children: FolderNode[];
  active: boolean;
};

const indent = (n: number) => `${(n - 1) * 16}px`;

const HomePage = () => {
  const [tree, setTree] = useState<FolderNode[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const flatList = useMemo(() => {
    const list: FolderNode[] = [];
    const walk = (n: FolderNode) => {
      list.push(n);
      n.children?.forEach(walk);
    };
    tree.forEach(walk);
    return list;
  }, [tree]);

  const load = async () => {
    setLoading(true);
    try {
      const [t, s, l] = await Promise.all([api.getTree(), api.getSettings(), api.getLogs()]);
      setTree(t);
      setSettings(s);
      setLogs(l ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleFolder = (id: number, active: boolean) => {
    setSettings((prev: any) => {
      const next = { ...prev };
      next.folderPrefs = { ...(prev?.folderPrefs ?? {}), [String(id)]: { active } };
      // also reflect in UI tree
      const updateTree = (nodes: FolderNode[]): FolderNode[] =>
        nodes.map((n) => ({ ...n, active: n.id === id ? active : n.active, children: updateTree(n.children || []) }));
      setTree((t) => updateTree(t));
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const s = await api.updateSettings({
        folderPrefs: settings.folderPrefs,
        options: settings.options,
        levelMapping: settings.levelMapping,
        contentTypeConfig: settings.contentTypeConfig,
      });
      setSettings(s);
    } finally {
      setSaving(false);
    }
  };

  const resync = async () => {
    setSaving(true);
    try {
      await api.resync();
      const l = await api.getLogs();
      setLogs(l ?? []);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Main>
      <Flex direction="column" gap={6} padding={6}>
        <Typography variant="alpha">Portfolio</Typography>

        <Flex gap={8} alignItems="flex-start">
          <Box shadow="filterShadow" padding={4} hasRadius style={{ minWidth: 420 }}>
            <Typography fontWeight="bold">Dossiers médias</Typography>
            <Box paddingTop={3}>
              {loading && <Typography>Chargement…</Typography>}
              {!loading && flatList.length === 0 && <Typography>Aucun dossier</Typography>}
              {!loading &&
                flatList.map((n) => (
                  <Flex key={n.id} gap={3} alignItems="center" style={{ paddingLeft: indent(n.level) }}>
                    <Switch
                      selected={settings?.folderPrefs?.[String(n.id)]?.active ?? n.active}
                      onLabel="Actif"
                      offLabel="Inactif"
                      onChange={(e: any) => toggleFolder(n.id, e.target.checked)}
                    />
                    <Typography>{n.name}</Typography>
                  </Flex>
                ))}
            </Box>
          </Box>

          <Box shadow="filterShadow" padding={4} hasRadius style={{ flex: 1 }}>
            <Typography fontWeight="bold">Paramètres</Typography>
            <Box paddingTop={3}>
              <Flex gap={6}>
                <Flex direction="column" gap={2}>
                  <Typography>Synchro dossier auto</Typography>
                  <Switch
                    selected={!!settings?.options?.autoSyncOnFolderCreate}
                    onLabel="On"
                    offLabel="Off"
                    onChange={(e: any) =>
                      setSettings((s: any) => ({
                        ...s,
                        options: { ...s.options, autoSyncOnFolderCreate: e.target.checked },
                      }))
                    }
                  />
                </Flex>
                <Flex direction="column" gap={2}>
                  <Typography>Synchro fichier auto</Typography>
                  <Switch
                    selected={!!settings?.options?.autoSyncOnFileUpload}
                    onLabel="On"
                    offLabel="Off"
                    onChange={(e: any) =>
                      setSettings((s: any) => ({
                        ...s,
                        options: { ...s.options, autoSyncOnFileUpload: e.target.checked },
                      }))
                    }
                  />
                </Flex>
              </Flex>
            </Box>

            <Box paddingTop={4}>
              <Flex gap={3}>
                <Button onClick={save} loading={saving} disabled={loading} variant="default">
                  Enregistrer
                </Button>
                <Button onClick={resync} loading={saving} disabled={loading} variant="secondary">
                  Resynchroniser
                </Button>
              </Flex>
            </Box>
          </Box>
        </Flex>

        <Box shadow="filterShadow" padding={4} hasRadius>
          <Typography fontWeight="bold">Logs</Typography>
          <Box paddingTop={3}>
            {logs.length === 0 && <Typography>Aucune action récente</Typography>}
            {logs.map((l, i) => (
              <Typography key={i} textColor={l.level === 'error' ? 'danger600' : l.level === 'warn' ? 'warning600' : 'neutral800'}>
                [{new Date(l.ts).toLocaleString()}] {l.message}
              </Typography>
            ))}
          </Box>
        </Box>
      </Flex>
    </Main>
  );
};

export { HomePage };
