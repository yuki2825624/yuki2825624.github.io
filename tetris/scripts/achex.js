// @ts-check

/** @param {string|number} input */
const unique = (input) => {
    if (typeof input === "number")
        return Array.from({ length: input }, () => (Math.floor(Math.random() * 37)).toString(36)).join("");
    if (typeof input === "string")
        return input.replace(/x/g, () => (Math.floor(Math.random() * 37)).toString(36));
    return unique(8);
}

class Achex {
    /** @type {WebSocket} */
    #ws;

    #events = [];

    constructor() {
        if (!isOnline) throw Error("Achex cant processing on offline");
        this.url = "wss://cloud.achex.ca/Tetris-Demo";
        this.id = unique(20);
        /** @type {AchexSession | null} */
        this.session = null;
        /** @type {AchexHub | null} */
        this.hub = null;
    }

    reload() {
        return new Promise((resolve) => {
            this.#ws = new WebSocket("wss://cloud.achex.ca/Tetris-Demo");
            const start = Date.now();
            console.log("Achex luanching...");

            this.#ws.addEventListener("open", () => {
                console.log(`Achex luanched in ${Date.now() - start}ms!`);
                resolve(null);
            });

            this.#ws.addEventListener("message", (ev) => {
                const { data } = ev;
                this.emit("data", JSON.parse(data));
            });

            this.#ws.addEventListener("error", () => {
                this.reload();
            });

            this.#ws.addEventListener("close", () => {
                this.reload();
            });
        })
    }

    login() {
        return new Promise((resolve) => {
            this.request({ auth: this.id, passwd: `${this.id}-PW` });
            this.once("data", (data) => {
                console.log("maybe Auth:", data);
                if ("auth" in data && "SID" in data) {
                    const { auth, SID: sid } = data;
                    if (auth === "OK") {
                        this.session = new AchexSession(sid);
                        resolve(true);
                    }
                }
                resolve(false);
            });
        });
    }

    connect(hub) {
        if (!this.session) throw Error("Achex session is invalid.");
        return new Promise((resolve) => {
            this.request({ joinHub: hub });
            this.once("data", (data) => {
                console.log("maybe JoinHub:", hub, data);
                if ("joinHub" in data) {
                    const { joinHub } = data;
                    if (joinHub === "OK") {
                        this.hub = new AchexHub(hub);
                        resolve(true);
                    }
                }
                resolve(false);
            });
        });
    }

    disconnect() {
        if (!this.session) throw Error("Achex session is invalid.");
        const hub = this.hub;
        if (!hub) throw Error("Achex does not connected.");
        return new Promise((resolve) => {
            this.request({ leaveHub: hub.name });
            /* this.once("data", (data) => { // バグでleaveHubのレスポンスが返ってこない
                if ("leaveHub" in data) {
                    const { leaveHub } = data;
                    if (leaveHub === "Ok") {
                        this.hub = null;
                        resolve(true);
                    }
                }
                resolve(false);
            }); */
            console.log("maybe leaveHub:", this.hub);
            this.hub = null;
            resolve(true);
        });
    }

    request(data) { // MEMO: toHは自分以外に送信される, leaveHubはレスポンスが返ってこない
        this.#ws.send(JSON.stringify(data));
    }

    on(eventName, callback) {
        this.#events.push({ name: eventName, callback });
        return callback;
    }

    once(eventName, callback) {
        const i = this.on(eventName, (arg) => {
            callback(arg);
            this.off(eventName, i);
        });
        return i;
    }

    off(eventName, callback) {
        const i = this.#events.findIndex((event) => event.name === eventName && event.callback === callback);
        if (i != -1) this.#events.splice(i, 1);
    }

    emit(eventName, arg) {
        const events = this.#events.filter((event) => event.name === eventName);
        for (const event of events) {
            event.callback(arg);
        }
    }
}

class AchexSession {
    constructor(id) {
        this.id = id;
    }
}

class AchexHub {
    constructor(name) {
        this.name = name;
    }
}

/* class Achex {
    @type {WebSocket}
    #ws;

    #events = [];

    #requests = [];

    #connection = (packet) => void 0;

    constructor() {
        this.hub = null;
        this.reload();
    }

    reload() {
        this.#ws = new WebSocket("wss://cloud.achex.ca/Tetris-Demo");
        this.#ws.addEventListener("open", () => {
            this.emit("luanch");
        });

        this.#ws.addEventListener("message", ({ data }) => {
            let packet = null;
            try { packet = JSON.parse(data); } catch (e) { };
            if (packet) {
                this.emit("data", packet);
                if ("FROM" in packet) {

                }
                else {
                    const callback = this.#requests.shift();
                    if (callback) callback(packet);
                }
                if ("toH" in packet || "leftHub" in packet) this.#connection(packet);
            }
        });

        this.#ws.addEventListener("close", () => {
            this.reload();
        });

        this.#ws.addEventListener("error", () => {
            this.reload();
        });
    }

    auth(name, password) {
        return new Promise(async (resolve, reject) => {
            const packet = await this.request({ "auth": name, "passws": password }, 4000);
            const { auth, SID: sid } = packet;
            if (auth === "OK") {
                this.id = sid;
                this.name = name;
                this.password = password;
                resolve(null);
            }
            else {
                reject(new Error(`Authorize failed: ${JSON.stringify(packet)}`));
            }
        });
    }

    connect(name, callback) {
        return new Promise(async (resolve, reject) => {
            const packet = await this.request({ "joinHub": name }, 4000);
            const { joinHub } = packet;
            if (joinHub === "OK") {
                this.hub = String(name);
                this.#connection = callback;
                await this.send("hub", { "joinedHub": name, "user": this.name, "sID": this.id });
                resolve(null);
            }
            else {
                reject(new Error(`Connect failed: ${JSON.stringify(packet)}`));
            }
        });
    }

    disconnect() {
        return new Promise(async (resolve, reject) => {
            await this.request({ "leaveHub": this.hub }); // 何故かレスポンス返って来ない
            // const packet = await this.send("hub", {});

            this.hub = null;
            this.#connection = () => void 0;
            // if (leaveHub === "OK") {
            //     this.hub = null;
            //     this.#connection = () => void 0;
            //     resolve(null);
            // }
            // else {
            //     reject(new Error(`Disconnect failed: ${JSON.stringify(packet)}`));
            // }
            resolve(null);

        });
    }

    send(target, data) {
        if (target === "hub") {
            return this.request({ "toH": this.hub, ...data });
        }
    }

    request(data, delay) {
        return new Promise((resolve) => {
            console.log("request:", data);
            if (delay > 0) {
                const id = setTimeout(() => {
                    console.log(this.#requests);
                    throw Error(`Packet response timeout: ${JSON.stringify(data)}`);
                }, delay);

                this.#requests.push((packet) => {
                    clearTimeout(id);
                    resolve(packet);
                });
            }
            else {
                resolve(null);
            }
            this.#ws.send(JSON.stringify(data));
        });
    }

    on(name, callback) {
        this.#events.push({ name, callback });
    }

    off(name, callback) {
        const index = this.#events.findIndex((event) => event.name === name && event.callback === callback);
        if (index != -1) this.#events.splice(index, 1);
    }

    emit(name, data) {
        for (const event of this.#events) {
            if (name === event.name) event.callback(data);
        }
    }
}

const achex = new Achex();
achex.on("luanch", async () => {
    achex.on("data", (data) => {
        console.log("DATALOG:", data);
    });

    await achex.auth(unique("USER#xxxxxxxx"), unique(12));
}); */

// class Achex {
//     /** @type {WebSocket} */
//     #ws;

//     #events = [];

//     #requests = [];

//     /** @type {(packet: any) => void} */
//     #connection = () => void 0;

//     constructor() {
//         this.key = unique(8); 情報取得の際のユニークキー
//         this.name = "hoge";
//         this.hub = null;
//         this.reload();
//     }

//     reload() {
//         this.#ws = new WebSocket("wss://cloud.achex.ca/Tetris-Demo");
//         this.#ws.addEventListener("open", () => {
//             this.emit("loaded");
//         });

//         this.#ws.addEventListener("message", ({ data }) => {
//             const packet = JSON.parse(data);
//             if (packet) {
//                 this.emit("data", packet);
//                 console.log(packet);

//                 if ("toH" in packet || "leftHub" in packet) this.#connection(packet);
//                 if ("FROM" in packet) {

//                 }
//                 else {
//                     const callback = this.#requests.shift();
//                     if (callback) callback(packet);
//                 }
//             }
//         });

//         this.#ws.addEventListener("close", () => {
//             this.reload();
//         });

//         this.#ws.addEventListener("error", () => {
//             this.reload();
//         });
//     }

//     async auth() {
//         MEMO: 全ユーザー情報の取得をするため全ユーザーの名前を統一
//         const packet = await this.request({ "auth": this.name, "passwd": "hoge_pw" }, true);
//         const { auth, SID: sid } = packet;
//         if (auth === "OK") {
//             this.id = sid;
//         }
//         else {
//             throw Error("authorize failed.");
//         }
//     }

//     connect(name, callback) {
//         return new Promise(async (resolve, reject) => {
//             const packet = await this.request({ "joinHub": name }, true);
//             const { joinHub } = packet;
//             if (joinHub === "OK") {
//                 this.hub = String(name);
//                 await this.request({ "toH": this.hub, "joinedHub": this.hub, "sID": this.id });

//                 this.#connection = callback;
//                 resolve(null);
//             }
//             else {
//                 reject(new Error(`Connect failed: ${JSON.stringify(packet)}`));
//             }
//         });
//     }

//     async disconnect() {
//         await this.request({ "leaveHub": this.hub });
//         this.hub = null;
//         this.#connection = () => void 0;
//     }

//     request(data, response) {
//         return new Promise((resolve, reject) => {
//             if (response) {
//                 const id = setTimeout(() => {
//                     reject(new Error(`Packet response timeout: ${JSON.stringify(data)}`));
//                 }, 5000);

//                 this.#requests.push((packet) => {
//                     clearTimeout(id);
//                     resolve(packet);
//                 });
//             }
//             this.#ws.send(JSON.stringify(data));
//         });
//     }

//     on(name, callback) {
//         this.#events.push({ name, callback });
//     }

//     off(name, callback) {
//         const index = this.#events.findIndex((event) => event.name === name && event.callback === callback);
//         if (index != -1) this.#events.splice(index, 1);
//     }

//     emit(name, data) {
//         for (const event of this.#events) {
//             if (name === event.name) event.callback(data);
//         }
//     }
// }

// const achex = new Achex();
// achex.on("loaded", async () => {
//     await achex.auth();
// });