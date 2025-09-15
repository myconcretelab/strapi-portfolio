"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("./controller"));
const portfolio_1 = __importDefault(require("./portfolio"));
exports.default = {
    controller: controller_1.default,
    portfolio: portfolio_1.default,
};
