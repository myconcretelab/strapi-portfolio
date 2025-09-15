import { getFetchClient } from '@strapi/sdk-plugin';

const client = getFetchClient();

export const api = {
  async getTree() {
    const res = await client.get('/strapi-portfolio/folders-tree');
    return res.data;
  },
  async getSettings() {
    const res = await client.get('/strapi-portfolio/settings');
    return res.data;
  },
  async updateSettings(payload: any) {
    const res = await client.put('/strapi-portfolio/settings', payload);
    return res.data;
  },
  async resync() {
    const res = await client.post('/strapi-portfolio/resync');
    return res.data;
  },
  async getLogs() {
    const res = await client.get('/strapi-portfolio/logs');
    return res.data;
  },
};

