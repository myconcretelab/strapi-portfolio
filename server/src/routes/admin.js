"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    {
        method: 'GET',
        path: '/folders-tree',
        handler: 'portfolio.getFoldersTree',
        config: {
            policies: [],
        },
    },
    {
        method: 'GET',
        path: '/settings',
        handler: 'portfolio.getSettings',
        config: {
            policies: [],
        },
    },
    {
        method: 'PUT',
        path: '/settings',
        handler: 'portfolio.updateSettings',
        config: {
            policies: [],
        },
    },
    {
        method: 'POST',
        path: '/resync',
        handler: 'portfolio.resync',
        config: {
            policies: [],
        },
    },
    {
        method: 'GET',
        path: '/logs',
        handler: 'portfolio.getLogs',
        config: {
            policies: [],
        },
    },
];
