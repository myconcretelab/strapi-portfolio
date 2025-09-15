"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("./service"));
const settings_1 = __importDefault(require("./settings"));
const folders_1 = __importDefault(require("./folders"));
const sync_1 = __importDefault(require("./sync"));
const logger_1 = __importDefault(require("./logger"));
exports.default = {
    service: service_1.default,
    settings: settings_1.default,
    folders: folders_1.default,
    sync: sync_1.default,
    logger: logger_1.default,
};
