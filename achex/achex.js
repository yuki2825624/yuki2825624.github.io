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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Achex = void 0;
const ws_1 = require("ws");
class Achex {
    constructor(id, passward) {
        this.active = false;
        this.session = null;
        this.requests = [];
        this.ws = new ws_1.WebSocket("wss://cloud.achex.ca/");
        this.ws.on("open", () => __awaiter(this, void 0, void 0, function* () {
            this.active = true;
            const packet = yield this.request("auth", { auth: id, passwd: passward });
            if (packet.auth.toLowerCase() !== "ok")
                throw Error("failed");
            const { SID } = packet;
            this.session = new Session(SID);
        }));
        this.ws.on("message", (data, isBinary) => {
            console.log(data);
            if (isBinary)
                throw TypeError("'data' must not be binary.");
            let packet = null;
            try {
                packet = JSON.parse(data);
            }
            catch (e) { }
            ;
            if (!packet)
                return;
            if ("error" in packet)
                return console.error("Packet Error:", packet.error);
            this.requests.forEach(([event, resolve], i) => {
                const fn = () => {
                    resolve(packet);
                    this.requests.splice(i, 1);
                };
                const flag = [
                    event === "auth" && "auth" in packet,
                    event === "joinHub" && "joinHub" in packet,
                    event === "leaveHub" && "leaveHub" in packet,
                    event === "ping" && "ltcy" in packet,
                    event === "echo" && "echo" in packet
                ].includes(true);
                if (flag)
                    fn();
            });
            console.log(packet);
        });
    }
    close() {
        console.log("WebSocket closing...");
        this.ws.close();
    }
    request(event, data, returns = true) {
        return new Promise((resolve, reject) => {
            console.log(returns);
            if (returns) {
                const pushed = this.requests.push([event, (packet) => resolve(packet)]);
                const timeout = 1000 * 5;
                setTimeout(() => {
                    this.requests.splice(pushed - 1, 1);
                    reject(`Packet timeout in ${timeout}ms: ${JSON.stringify(data)}`);
                }, timeout);
            }
            else {
                resolve({});
            }
            this.ws.send(JSON.stringify(data));
        });
    }
    ping() {
        return __awaiter(this, void 0, void 0, function* () {
            const packet = yield this.request("ping", { ping: true });
            return packet.ltcy;
        });
    }
    echo(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const packet = yield this.request("echo", { echo: message });
            console.log("Echo:", packet);
        });
    }
    joinHub(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const packet = yield this.request("joinHub", { joinHub: name });
            return packet.joinHub;
        });
    }
    leaveHub(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const packet = yield this.request("leaveHub", { leaveHub: name });
            return packet.leaveHub;
        });
    }
    sendToUser(user, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.request("sendToUser", Object.assign({ to: user }, data), false);
        });
    }
    sendToSession(session, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.request("sentToSession", Object.assign({ toS: session }, data), false);
        });
    }
    sendToHub(hub, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.request("sentToHub", Object.assign({ toH: hub }, data), false);
        });
    }
}
exports.Achex = Achex;
class Session {
    constructor(id) {
        this.id = id;
    }
}
