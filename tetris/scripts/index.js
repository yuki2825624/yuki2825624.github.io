// @ts-check


const isMobile = /Mobile/i.test(navigator.userAgent);

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
        this.#buttons = buttons;
        for (const button of buttons) {
            button.display(button);
        }
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

function MultiSelectionMenu() {
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
                    .onPush(async () => {
                        const i = setInterval(LoadingMenu, 50);

                        await new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(null);
                            }, 500);
                        });

                        clearInterval(i);
                        MultiSelectionMenu();
                    }),
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
                        const i = setInterval(LoadingMenu, 50);
                      
                        // await new Promise(async (resolve) => {
                        //     await achex.connect(String(achex.id), (data) => {
                        //         if ("joinedHub" in data) {
                        //             resolve(null);
                        //         }
                        //         console.log("hub:", data);
                        //     });
                        // })

                        clearInterval(i);
                        MultiSelectionMenu();
                    })
            ]

            const count = 1;
            for (let i = 0; i < count; i++) {
                buttons.push(
                    new Button({ x: Main.width(5), y: Main.height(15), w: Main.width(40), h: Main.width(4) })
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
                            ctx.fillText("hoge", Main.width(6), Main.height(19));
                            // ctx.fillText("1 / 2", Main.width(39), Main.height(19));
                        })
                        .onPush(async () => {
                            const id = setInterval(LoadingMenu, 50);
                            
                            await new Promise(async (resolve) => {
                                await achex.connect("hoge", (packet) => {
                                    console.log(packet);
                                    if ("joinedHub" in packet) {
                                        achex.send("hub", { "match": true });
                                        resolve(null);
                                    }
                                    if ("match" in packet) {
                                        resolve(null);
                                    }
                                });
                            });

                            clearInterval(id);
                            MultiGameMenu();
                        })
                );
            }

            Main.buttons = buttons;
        });
    menu.show();
}

async function MultiGameMenu() {
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
}

function LoadingMenu(callback = () => void 0) {
    variable.loading ??= { "0": 0, "1": 0, "2": 0 };
    const { loading } = variable;
    
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

document.addEventListener("DOMContentLoaded", () => {
    Main.initialize();
    MainMenu();
});

