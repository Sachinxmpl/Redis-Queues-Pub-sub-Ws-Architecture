"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
const redis_1 = require("redis");
const app = (0, express_1.default)();
const httpServer = app.listen(8080);
const wss = new ws_1.default.Server({ server: httpServer });
const subscriberClient = (0, redis_1.createClient)({
    url: "redis://localhost:6379"
});
subscriberClient.on('error', (err) => console.error("Redis client error", err));
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    //   ws.on('message', function message(data, isBinary) {
    //     // 1. Convert the received Buffer/ArrayBuffer data to a string.
    //     // If it's not binary, it should be treated as UTF-8 text.
    //     const messageString = data.toString('utf8'); 
    //     wss.clients.forEach(function each(client) {
    //       if (client.readyState === WebSocket.OPEN) {
    //         // 2. Broadcast the string, not the raw Buffer.
    //         // We set binary to false since we know it's a string.
    //         client.send(messageString, { binary: false }); 
    //       }
    //     });
    //   });
});
function startSubscriber() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield subscriberClient.connect();
            console.log("Subscriber connected to redis");
            yield subscriberClient.subscribe("processed_submissions", (message) => {
                console.log("Received message from processed_submissions channel", message);
                // Broadcast to all connected websocket clients 
                wss.clients.forEach(function each(client) {
                    if (client.readyState === ws_1.default.OPEN) {
                        client.send(message, { binary: false });
                    }
                });
            });
            console.log("Subscribed to processed_submissions channel");
        }
        catch (err) {
            console.error("Failed to connect to redis", err);
        }
    });
}
startSubscriber();
