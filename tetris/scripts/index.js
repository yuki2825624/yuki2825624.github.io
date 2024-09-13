// @ts-check


const isMobile = /Mobile/i.test(navigator.userAgent);
const isOnline = navigator.onLine;

const variable = {};

class Main {
    /** @type {Button[]} */
    static #buttons = [];

    /** @type {Menu} */
    static menu;

    /** @type {Game} */
    static game;

    /** @param {Button[]} buttons */
    static set buttons(buttons) {
        for (const button of buttons) {
            button.display(button);
        }
        this.#buttons = buttons;
    }

    static WIDTH = 1920;

    static HEIGHT = 1440;

    static get canvas() {
        const canvas = document.getElementById("canvas");
        if (!(canvas instanceof HTMLCanvasElement)) throw Error("'canvas' is not HTMLCanvasElement");
        return canvas;
    }

    static get ctx() {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) throw Error("'ctx' is null");
        return ctx;
    }

    static initialize() {
        window.addEventListener("resize", () => {
            this.menu.show();
        });

        document.addEventListener("keydown", (ev) => {
            const { code } = ev;

            if (!this.game) return;
            const { field, hold } = this.game;

            if (!field.node) return;

            switch (code) {
                case "ArrowDown": {
                    field.move("Down");
                    break;
                }
                case "ArrowRight": {
                    field.move("Right");
                    break;
                }
                case "ArrowLeft": {
                    field.move("Left");
                    break;
                }
                case "Space": {
                    let flag = false;
                    do { flag = field.move("Down"); } while (flag);
                    field.decontrol();
                    break;
                }
                case "KeyZ": {
                    field.flip("Right");
                    break;
                }
                case "KeyX": {
                    field.flip("Left");
                    break;
                }
                case "KeyA": {
                    // field.decontrol();
                    hold.hold();
                    break;
                }
            }
        });

        this.canvas.addEventListener("mousemove", (ev) => {
            const { offsetX: x, offsetY: y } = ev;
            const flag = this.#buttons.some(({ data }) => x >= data.x && x <= (data.x + data.w) && y >= data.y && y <= (data.y + data.h));
            this.canvas.style.cursor = flag ? "pointer" : "default";
        });

        this.canvas.addEventListener("mousedown", (ev) => {
            const { offsetX: x, offsetY: y, buttons: key } = ev;
            if (key !== 1) return;
            const button = this.#buttons.find(({ data }) => x >= data.x && x <= (data.x + data.w) && y >= data.y && y <= (data.y + data.h));
            if (button) button.push(button);
        });
    }

    static len(m) {
        if (m.startsWith("w")) return this.width(+m.slice(1));
        if (m.startsWith("h")) return this.height(+m.slice(1));
        return NaN;
    }

    static width(m) {
        return this.canvas.width * (m / 100);
    }

    static height(m) {
        return this.canvas.height * (m / 100);
    }

    static sizeHandler() {
        const { clientWidth: width, clientHeight: height } = document.documentElement;
        const { WIDTH, HEIGHT, canvas, ctx } = this;
        const m = Math.max(width, height);
        const n = Math.min(m * width / WIDTH, m * height / HEIGHT);
        const w = WIDTH / m * n;
        const h = HEIGHT / m * n;
        canvas.width = w;
        canvas.height = h;
        canvas.style.top = Math.max(Math.floor((height - h) / 2), 0) + "px";
        canvas.style.left = Math.max(Math.floor((width - w) / 2), 0) + "px";
        const style = ctx.createLinearGradient(w, 0, w, h);
        style.addColorStop(0, "#000000");
        style.addColorStop(1, "#333333");
        ctx.fillStyle = style;
        ctx.fillRect(0, 0, w, h);
    }
}

class Menu {
    display = () => void 0;

    constructor() {

    }

    onDisplay(callback) {
        this.display = callback;
        return this;
    }

    show() {
        Main.buttons = [];
        Main.menu = this;
        Main.sizeHandler();
        this.display();
    }
}

class Button {
    /** @type {(button: Button) => void}  */
    display = () => void 0;

    /** @type {(button: Button) => void}  */
    push = () => void 0;

    /** @param {{ x: number, y: number, w: number, h: number }} data  */
    constructor(data) {
        this.data = data;
    }

    /** @param {(button: Button) => void} callback  */
    onDisplay(callback) {
        this.display = callback;
        return this;
    }

    /** @param {(button: Button) => void} callback  */
    onPush(callback) {
        this.push = callback;
        return this;
    }
}

function MainMenu() {
    const menu = new Menu()
        .onDisplay(() => {
            const { ctx } = Main;

            ctx.font = `${Main.width(17)}px tetris`;
            ctx.strokeStyle = "#ffffff";
            ctx.strokeText("TETRIS", Main.width(5), Main.height(40));

            Main.buttons = [
                new Button({ x: Main.width(65), y: Main.height(65), w: Main.width(28.5), h: Main.width(7.5) })
                    .onDisplay((button) => {
                        const { x, y, w, h } = button.data;

                        ctx.strokeStyle = "#ffffff";
                        ctx.strokeRect(x, y, w, h);

                        ctx.font = `${Main.width(5)}px tetris`;
                        ctx.fillStyle = "#ffffff";
                        ctx.fillText("Solo", Main.width(73), Main.height(72));
                    })
                    .onPush(async () => {
                        const i = setInterval(LoadingMenu, 50);
                        await new Promise((resolve) => setTimeout(resolve, 500));
                        clearInterval(i);
                        SoloGameMenu();
                    }),
                new Button({ x: Main.width(65), y: Main.height(80), w: Main.width(28.5), h: Main.width(7.5) })
                    .onDisplay((button) => {
                        const { x, y, w, h } = button.data;

                        ctx.strokeStyle = "#ffffff";
                        ctx.strokeRect(x, y, w, h);

                        ctx.font = `${Main.width(5)}px tetris`;
                        ctx.fillStyle = "#ffffff";
                        ctx.fillText("Multi", Main.width(72), Main.height(87));
                    })
                    .onPush(async () => {
                        MultiSelectionMenu();
                    })
            ];
        });
    menu.show();
}

async function SoloGameMenu() {
    Main.game = new Game({ x: "w35", y: "h10", w: "w30", h: "w60" });
    Main.game.start();

    const menu = new Menu()
        .onDisplay(() => {
            const { ctx } = Main;

            Main.buttons = [
                new Button({ x: Main.width(4), y: Main.width(3), w: Main.width(15), h: Main.width(4.5) })
                    .onDisplay((button) => {
                        const { x, y, w, h } = button.data;

                        ctx.font = `${Main.width(4)}px tetris`;
                        ctx.fillStyle = "#ffffff";
                        ctx.fillText("< BACK", x, Main.width(6.5));
                    })
                    .onPush(() => {
                        Main.game.end();
                        setTimeout(MainMenu, 10);
                    })
            ];

            Main.game.display();
        });
    menu.show();
}

async function fetchHubs(timeout = 1000) {
    if (achex.hub) await achex.disconnect();
    const hubs = new Map();

    await achex.connect("matching");

    await new Promise((resolve) => {
        const callback = achex.on("data", (data) => {
            if ("id" in data && !hubs.has(data.id)) hubs.set(data.id, data);
            console.log(data);
        });

        setTimeout(() => {
            achex.off("data", callback);
            resolve(null);
        }, timeout);
    });

    await achex.disconnect();

    return [...hubs.values()];
}

async function MultiSelectionMenu() {
    const i = setInterval(LoadingMenu, 50);
    const hubs = await fetchHubs(1000);
    clearInterval(i);
    const menu = new Menu()
        .onDisplay(() => {
            const { ctx } = Main;

            const buttons = [
                new Button({ x: Main.width(4), y: Main.width(3), w: Main.width(15), h: Main.width(4.5) })
                    .onDisplay((button) => {
                        const { x, y, w, h } = button.data;

                        ctx.font = `${Main.width(4)}px tetris`;
                        ctx.fillStyle = "#ffffff";
                        ctx.fillText("< BACK", x, Main.width(6.5));
                    })
                    .onPush(MainMenu),
                new Button({ x: Main.width(60), y: Main.height(3), w: Main.width(20), h: Main.width(6) })
                    .onDisplay((button) => {
                        const { x, y, w, h } = button.data;

                        ctx.strokeStyle = "#ffffff";
                        ctx.strokeRect(x, y, w, h);

                        ctx.font = `${Main.width(4)}px tetris`;
                        ctx.fillStyle = "#ffff00";
                        ctx.fillText("RELOAD", Main.width(61.5), Main.width(6.5));
                    })
                    .onPush(MultiSelectionMenu),
                new Button({ x: Main.width(80), y: Main.height(3), w: Main.width(17), h: Main.width(6) })
                    .onDisplay((button) => {
                        const { x, y, w, h } = button.data;

                        ctx.strokeStyle = "#ffffff";
                        ctx.strokeRect(x, y, w, h);

                        ctx.font = `${Main.width(4)}px tetris`;
                        ctx.fillStyle = "#00ff00";
                        ctx.fillText("+ NEW", Main.width(81.5), Main.width(6.5));
                    })
                    .onPush(async () => {
                        await achex.connect("matching");
                        const ids = [
                            setInterval(() => {
                                LoadingMenu(() => {
                                    ctx.fillStyle = "#ffffff";
                                    ctx.font = `${Main.width(4)}px tetris`;
                                    ctx.fillText(`Room Session - ${achex.session?.id}`, Main.width(5), Main.height(20));
                                });
                            }, 50),
                            setInterval(() => {
                                achex.request({ "toH": "matching", "id": achex.id, "session": achex.session?.id });
                                console.log("request to matching hub");
                            }, 200)
                        ];
                        const callback = achex.on("data", (data) => {
                            if ("match" in data && data.match) {
                                ids.forEach(clearInterval);
                                achex.off("data", callback);
                                achex.request({ to: data.FROM, match: true });
                                MultiGameMenu(achex.id);
                            }
                        });
                    })
            ];

            for (let i = 0; i < hubs.length; i++) {
                const hub = hubs[i];
                buttons.push(
                    new Button({ x: Main.width(5), y: Main.height(15 + i * 7), w: Main.width(40), h: Main.width(4) })
                        .onDisplay((button) => {
                            const { x, y, w, h } = button.data;

                            ctx.strokeStyle = "#cccccc";
                            const r = Main.width(2);
                            ctx.beginPath();
                            ctx.moveTo(x + r, y);
                            ctx.lineTo(x + w - r, y);
                            ctx.arc(x + w - r, y + r, r, Math.PI * (3 / 2), 0, false);
                            ctx.lineTo(x + w, y + h - r);
                            ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * (1 / 2), false);
                            ctx.lineTo(x + r, y + h);
                            ctx.arc(x + r, y + h - r, r, Math.PI * (1 / 2), Math.PI, false);
                            ctx.lineTo(x, y + r);
                            ctx.arc(x + r, y + r, r, Math.PI, Math.PI * (3 / 2), false);
                            ctx.closePath();
                            ctx.stroke();

                            ctx.font = `${Main.width(3)}px tetris`;
                            ctx.fillStyle = "#ffffff";
                            ctx.fillText(hub.session, Main.width(6), Main.height(19 + i * 7));
                            // ctx.fillText("1 / 2", Main.width(39), Main.height(19));
                        })
                        .onPush(() => {
                            console.log(hub);
                            achex.request({ "to": hub.id, "match": true });
                            const start = Date.now();
                            const callback = achex.once("data", (data) => {
                                if ("match" in data && data.match) {
                                    MultiGameMenu(hub.id);
                                    console.log(Date.now() - start, "MS DELAY");
                                }
                            });
                            setTimeout(() => achex.off("data", callback), 1000);
                        })
                );
            }

            Main.buttons = buttons;
        });
    menu.show();
}

async function MultiGameMenu(name) {
    if (achex.hub) await achex.disconnect();
    await achex.connect(name);
    const callback = achex.on("data", async (data) => {
        if ("toH" in data) {
            if ("tiles" in data) {
                const { tiles } = data;
                target.field.tiles = tiles.map((lines, y) => lines.map((tile, x) => new FieldBlock(target.field, x, y, { hex: tile.hex, state: tile.state })));
            }
            if ("stack" in data) {
                const { stack } = data;
                target.stack = stack;
            }
            if ("holding" in data) {
                const { holding } = data;
                if (holding) target.hold.holding = new Mino(target, holding);
            }
            if ("score" in data) {
                const { score } = data;
                target.score.value = score;
            }
            if ("upLine" in data) {
                const { upLine } = data;
                Main.game.field.upLine += upLine;
                console.log(data);
            }
            menu.show();
        }

        if ("leftHub" in data) {
            if (achex.hub) await achex.disconnect();
            achex.off("data", callback);
            Main.game.end();
            setTimeout(MainMenu, 10);
        }
    });

    // const data = { x: "w15", y: "h20", w: "w20", h: "w40" };
    Main.game = new Game({ x: "w15", y: "h20", w: "w20", h: "w40" });
    Main.game.start().then(async () => {
        if (achex.hub) await achex.disconnect();
        achex.off("data", callback);
        Main.game.end();
        setTimeout(MainMenu, 10);
    });
    Main.game.field.onDeleteLine((line, tflip) => {
        const upLine = (line - 1 + (tflip ? 2 : 0)) - Main.game.field.upLine;
        if (upLine > 0) {
            achex.request({ "toH": name, "upLine": upLine });
            Main.game.field.upLine = 0;
        }
        else {
            Main.game.field.upLine = -upLine;
        }
    });

    const target = new Game({ x: "w65", y: "h20", w: "w20", h: "w40" });

    const handle = () => {
        const { game } = Main;
        const data = {
            tiles: game.field.tiles.map((lines) => lines.map((tile) => ({ hex: tile.hex, state: tile.state }))),
            stack: game.stack,
            holding: game.hold.holding?.shape,
            score: game.score.value
        };
        achex.request({ "toH": name, ...data });
    }
    handle();

    const menu = new Menu()
        .onDisplay(() => {
            const { ctx } = Main;

            Main.buttons = [
                new Button({ x: Main.width(4), y: Main.width(3), w: Main.width(15), h: Main.width(4.5) })
                    .onDisplay((button) => {
                        const { x, y, w, h } = button.data;

                        ctx.font = `${Main.width(4)}px tetris`;
                        ctx.fillStyle = "#ffffff";
                        ctx.fillText("< BACK", x, Main.width(6.5));
                    })
                    .onPush(async () => {
                        await achex.disconnect();
                        achex.off("data", callback);
                        Main.game.end();
                        setTimeout(MainMenu, 10);
                    })
            ];

            Main.game.display();
            target.display();
            handle();
        });
    menu.show();
}

/* async function MultiGameMenu() {
    await achex.connect("hoge", async (packet) => {
        const { sID: id } = packet;

        if (achex.id === id) return;
        if ("toH" in packet) {
            if ("tiles" in packet) {
                const { tiles } = packet;
                target.field.tiles = tiles.map((lines, y) => lines.map((tile, x) => new FieldBlock(target.field, x, y, { hex: tile.hex, state: tile.state })));
            }
            if ("stack" in packet) {
                const { stack } = packet;
                target.stack = stack;
            }
            if ("holding" in packet) {
                const { holding } = packet;
                if (holding) target.hold.holding = new Mino(target, holding);
            }
            if ("score" in packet) {
                const { score } = packet;
                target.score.value = score;
            }
            menu.show();
        }

        if ("leftHub" in packet) {
            await achex.disconnect();
            Main.game.end();
            setTimeout(MainMenu, 10);
        }
    });
    
    // const data = { x: "w15", y: "h20", w: "w20", h: "w40" };
    Main.game = new Game({ x: "w15", y: "h20", w: "w20", h: "w40" });
    Main.game.start().then(async () => {
        await achex.disconnect();
        Main.game.end();
        setTimeout(MainMenu, 10);
    });
    const target = new Game({ x: "w65", y: "h20", w: "w20", h: "w40" });
    
    const handle = () => {
        const { game } = Main;
        const data = {
            tiles: game.field.tiles.map((lines) => lines.map((tile) => ({ hex: tile.hex, state: tile.state }))),
            stack: game.stack,
            holding: game.hold.holding?.shape,
            score: game.score.value
        };
        achex.send("hub", data);
    }
    handle();

    const menu = new Menu()
        .onDisplay(() => {
            const { ctx } = Main;

            Main.buttons = [
                new Button({ x: Main.width(4), y: Main.width(3), w: Main.width(15), h: Main.width(4.5) })
                    .onDisplay((button) => {
                        const { x, y, w, h } = button.data;

                        ctx.font = `${Main.width(4)}px tetris`;
                        ctx.fillStyle = "#ffffff";
                        ctx.fillText("< BACK", x, Main.width(6.5));
                    })
                    .onPush(async () => {
                        await achex.disconnect();
                        Main.game.end();
                        setTimeout(MainMenu, 10);
                    })
            ];

            Main.game.display();
            target.display();
            handle();
        });
    // menu.show();
} */

function LoadingMenu(callback = () => void 0) {
    const loading = variable.loading ??= { "0": 0, "1": 0, "2": 0 };

    loading[0] = (loading[0] + Math.PI / 10) % (2 * Math.PI);
    loading[1] = (loading[1] + Math.PI / 16) % (2 * Math.PI);
    loading[2] = (loading[2] + 0.3) % 4;

    const menu = new Menu()
        .onDisplay(() => {
            const { ctx } = Main;

            ctx.strokeStyle = "#ffffff";

            ctx.beginPath();
            ctx.arc(Main.width(70), Main.height(93), Main.width(3), loading[0], loading[0] + Math.PI * (2 / 3));
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(Main.width(70), Main.height(93), Main.width(2.5), loading[1], loading[1] + Math.PI * (2 / 3));
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.font = `${Main.width(4)}px tetris`;
            ctx.fillText("LOADING" + ".".repeat(loading[2]), Main.width(75), Main.height(95));
            callback();
        });
    menu.show();
}

const achex = new Achex();
document.addEventListener("DOMContentLoaded", async () => {
    Main.initialize();

    LoadingMenu();
    const i = setInterval(LoadingMenu, 50);

    await achex.reload();
    await achex.login();

    clearInterval(i);
    MainMenu();
});
