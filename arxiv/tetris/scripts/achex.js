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