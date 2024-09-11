// @ts-check

class Game {
    /** @param {{ x: string, y: string, w: string, h: string }} field  */
    constructor(field) {
        this.data = field;
        this.stack = [];
        this.field = new FieldPanel(this);
        this.next = new NextPanel(this);
        this.hold = new HoldPanel(this);
        this.score = new ScorePanel(this);
    }

    get x() { return Main.len(this.data.x); }

    get y() { return Main.len(this.data.y); }

    get w() { return Main.len(this.data.w); }

    get h() { return Main.len(this.data.h); }

    async start() {
        await this.field.start();
    }

    end() {
        this.field.end();
    }

    display() {
        this.field.display();
        this.next.display();
        this.hold.display();
        this.score.display();
    }
}

class Panel {
    /**
     * @param {Game} main 
     * @param {number} WIDTH 
     * @param {number} HEIGHT 
     */
    constructor(main, WIDTH, HEIGHT) {
        this.main = main;
        this.WIDTH = WIDTH;
        this.HEIGHT = HEIGHT;
    }

    get x() { return this.main.x; }

    get y() { return this.main.y; }

    get w() { return this.main.w; }

    get h() { return this.main.h; }

    get sizeX() {
        return this.w / this.WIDTH;
    }

    get sizeY() {
        return this.h / this.HEIGHT;
    }

    display() { // Background
        const { ctx } = Main;

        const [deltaX, deltaY] = [this.sizeX / 15, this.sizeY / 15];
        ctx.fillStyle = "#444444";
        ctx.fillRect(this.x - deltaX, this.y - deltaY, this.w + deltaX * 2, this.h + deltaX * 2);
    }
}

class FieldPanel extends Panel {
    constructor(main) {
        super(main, 10, 20);
        this.active = false;
        this.action = null;
        this.node = null;
        this.nodeX = 0;
        this.nodeY = 0;
        this.nodeRot = 0;
        this.tiles = Array.from({ length: this.HEIGHT }, (_, y) =>
            Array.from({ length: this.WIDTH }, (_, x) =>
                new FieldBlock(this, x, y)
            )
        );

        /** @type {(line: number) => void} */
        this.checkLine = (line) => void 0;
        /** @type {() => void} */
        this.decontrol = () => void 0;
    }

    /** @param {(line: number) => void} callback  */
    onCheckLine(callback) {
        this.checkLine = callback;
    }

    async start() {
        this.active = true;
        while (this.active) {
            await this.control();
            this.main.hold.held = false;
        }
    }

    end() {
        this.active = false;
        this.decontrol();
    }

    control() {
        return new Promise(async (resolve) => {
            if (this.node) return resolve(null);

            if (this.main.stack.length < Mino.rules.size) {
                const keys = [...Mino.rules.keys()];
                for (let i = keys.length - 1; i > 0; i--) {
                    let j = Math.floor(Math.random() * (i + 1));
                    [keys[i], keys[j]] = [keys[j], keys[i]];
                }
                this.main.stack.push(...keys);
            }

            const shape = this.main.stack.shift();
            setTimeout(() => this.main.display());

            this.node = new Mino(this.main, shape);
            this.nodeX = Math.floor(this.WIDTH / 2 - this.node.size / 2);
            this.nodeY = 0;
            this.nodeRot = 0;
            while (!this.outside(this.nodeX, this.nodeY - 1, this.nodeRot)) this.nodeY--;

            this.decontrol = async () => {
                this.decontrol = () => void 0;
                clearInterval(i);
                this.draw(true);
                await this.checkLines();
                this.node = null;
                this.nodeX = 0;
                this.nodeY = 0;
                this.nodeRot = 0;
                resolve(null);
            }

            const i = setInterval(() => {
                const flag = this.move("Down");
                if (!flag) this.decontrol();
            }, 700);

            if (!this.isValid(this.nodeX, this.nodeY, this.nodeRot)) {
                this.draw();
                this.end();
                resolve(null);
                return;
            }

            setTimeout(() => this.draw());
        });
    }

    draw(state = false) {
        if (!this.node) return;
        const template = this.node.template(this.nodeRot);
        for (const [offsetX, offsetY] of template.shape) {
            const [x, y] = [this.nodeX + offsetX, this.nodeY + offsetY];
            this.tiles[y][x] = new FieldBlock(this, x, y, { hex: this.node.hex, state });
        }
        this.main.display();
    }

    hide() {
        if (!this.node) return;
        const template = this.node.template(this.nodeRot);
        for (const [offsetX, offsetY] of template.shape) {
            const [x, y] = [this.nodeX + offsetX, this.nodeY + offsetY];
            this.tiles[y][x] = new FieldBlock(this, x, y, { hex: "#111111", state: false });
        }
        this.main.display();
    }

    move(dirct) {
        if (!this.node) return false;

        let flag = false;
        this.hide();
        if (dirct === "Up") {
            flag = this.isValid(this.nodeX, this.nodeY - 1, this.nodeRot);
            if (flag) this.nodeY -= 1;
        }
        if (dirct === "Down") {
            flag = this.isValid(this.nodeX, this.nodeY + 1, this.nodeRot);
            if (flag) this.nodeY += 1;
        }
        if (dirct === "Left") {
            flag = this.isValid(this.nodeX - 1, this.nodeY, this.nodeRot);
            if (flag) this.nodeX -= 1;
        }
        if (dirct === "Right") {
            flag = this.isValid(this.nodeX + 1, this.nodeY, this.nodeRot);
            if (flag) this.nodeX += 1;
        }
        this.draw();
        if (flag) this.action = "move";
        return flag;
    }

    flip(dirct) {
        if (!this.node) return false;

        let flag = false;
        this.hide();
        const template = this.node.template(this.nodeRot);
        if (dirct === "Right") {
            for (const [offsetX, offsetY] of template.right) {
                flag = this.isValid(this.nodeX + offsetX, this.nodeY + offsetY, this.nodeRot - 1);
                if (flag) {
                    this.nodeX += offsetX;
                    this.nodeY += offsetY;
                    this.nodeRot -= 1;
                    break;
                }
            }
        }
        if (dirct === "Left") {
            for (const [offsetX, offsetY] of template.left) {
                flag = this.isValid(this.nodeX + offsetX, this.nodeY + offsetY, this.nodeRot + 1);
                if (flag) {
                    this.nodeX += offsetX;
                    this.nodeY += offsetY;
                    this.nodeRot += 1;
                    break;
                }
            }
        }
        this.draw();
        if (flag) this.action = "flip";
        return flag;
    }

    outside(x, y, rot) {
        if (!this.node) return true;
        const template = this.node.template(rot);
        return template.shape.some(([offsetX, offsetY]) => {
            const [tx, ty] = [x + offsetX, y + offsetY];
            return tx < 0 || tx > (this.WIDTH - 1) || ty < 0 || ty > (this.HEIGHT - 1);
        });
    }

    collision(x, y, rot) {
        if (!this.node) return true;
        const template = this.node.template(rot);
        return template.shape.some(([offsetX, offsetY]) => {
            const [tx, ty] = [x + offsetX, y + offsetY];
            return this.tiles[ty]?.[tx]?.state;
        });
    }

    isValid(x, y, rot) {
        return !this.outside(x, y, rot) && !this.collision(x, y, rot);
    }

    checkLines() {
        return new Promise(async (resolve) => {
            const lines = Array.from({ length: this.tiles.length }, (_, line) => line)
                .filter((line) => this.tiles[line].every((tile) => tile.state));

            if (lines.length > 0) {
                const tflip = () => {
                    const node = this.node;
                    if (node && node.shape === "T" && this.action === "flip") {
                        const match = [[0, 0], [0, 2], [2, 0], [2, 2]].filter(([offsetX, offsetY]) => {
                            const [x, y] = [this.nodeX + offsetX, this.nodeY + offsetY];
                            return x < 0 || x > (this.WIDTH - 1) || y < 0 || y > (this.HEIGHT - 1) || this.tiles[y]?.[x]?.state;
                        });
                        return match.length >= 3;
                    }
                    return false;
                }

                if (tflip()) {
                    console.log("T-Flip");
                    this.main.score.value +=
                        lines.length === 1 ? 80 :
                            lines.length === 2 ? 120 :
                                lines.length === 3 ? 180 : 0;
                }
                else {
                    this.main.score.value +=
                        lines.length === 1 ? 10 :
                            lines.length === 2 ? 30 :
                                lines.length === 3 ? 50 :
                                    lines.length === 4 ? 80 : 0;
                }

                const tiles = [...this.tiles];

                /* for (let i = 0; i < 4; i++) {
                    await new Promise((resolve) => {
                        setTimeout(() => {
                            for (const line of lines) {
                                this.tiles[line] = this.tiles[line].map((_, x) => new FieldBlock(this, x, line, { hex: i % 2 == 0 ? "#fff" : "#000", state: true }));
                            }
                            this.main.display();
                            resolve(null);
                        }, 50);
                    });
                } */

                for (const line of lines) {
                    tiles[line] = tiles[line].map((_, x) => new FieldBlock(this, x, line, { hex: "#111111", state: false }));
                    for (let y = line - 1; y >= 0; y--) {
                        for (let x = 0; x < tiles[y].length; x++) {
                            const tile = tiles[y][x];
                            if (!tile.state) continue;
                            tiles[y][x] = new FieldBlock(this, x, y, { hex: "#111111", state: false });
                            tiles[y + 1][x] = new FieldBlock(this, x, tile.y + 1, { hex: tile.hex, state: tile.state });
                        }
                    }
                }

                this.tiles = tiles;
                this.main.display();

                this.checkLine(lines.length);
            }
            resolve(null);
        });
    }

    upLines(line) {
        const tiles = [...this.tiles];
        for (let i = 0; i < line; i++) {
            for (let y = 0; y < this.HEIGHT - 1; y++) {
                for (let x = 0; x < this.WIDTH; x++) {
                    const tile = this.tiles[y + 1][x];
                    if (!tile.state) continue;
                    tiles[y][x] = new FieldBlock(this, x, y, { hex: tile.hex, state: tile.state });
                }
            }
            const idx = Math.floor(Math.random() * this.WIDTH);
            const y = this.HEIGHT - 1;
            tiles[y] = Array.from({ length: this.WIDTH }, (_, x) =>
                x === idx
                    ? new FieldBlock(this, x, y, { hex: "#111111", state: false })
                    : new FieldBlock(this, x, y, { hex: "#dddddd", state: true })
            );
            this.move("Up");
        }
        this.tiles = tiles;
        this.main.display();
    }

    display() {
        super.display();
        // const { ctx } = Main;
        // const [deltaX, deltaY] = [this.sizeX / 15, this.sizeY / 15];
        for (let y = 0; y < this.tiles.length; y++) {
            for (let x = 0; x < this.tiles[y].length; x++) {
                const tile = this.tiles[y][x];
                tile.display();
            }
        }
    }
}

class FieldBlock {
    /**
     * 
     * @param {FieldPanel} field 
     * @param {number} x 
     * @param {number} y 
     * @param {{ hex?: string, state?: boolean }} [data] 
     */
    constructor(field, x, y, data = {}) {
        const { hex = "#111111", state = false } = data;
        this.field = field;
        this.x = x;
        this.y = y;
        this.hex = hex;
        this.state = state;
    }

    display() {
        const { ctx } = Main;
        const { field } = this;
        const [deltaX, deltaY] = [field.sizeX / 15, field.sizeY / 15];
        ctx.fillStyle = this.hex;
        ctx.fillRect(field.x + this.x * field.sizeX + deltaX, field.y + this.y * field.sizeY + deltaY, field.sizeX - deltaX * 2, field.sizeY - deltaY * 2);
    }
}

class NextPanel extends Panel {
    constructor(main) {
        super(main, 5, 15);
        this.length = 5;
    }

    get x() {
        return super.x + super.w;
    }

    get w() {
        return this.main.field.sizeX * this.WIDTH;
    }

    get h() {
        return this.main.field.sizeY * this.HEIGHT;
    }

    display() {
        super.display();
        const { ctx } = Main;
        const [deltaX, deltaY] = [this.sizeX / 15, this.sizeY / 15];
        const stack = [...this.main.stack];
        if (stack.length === 0) return;
        for (let i = 0; i < this.length; i++) {
            ctx.fillStyle = "#" + (0xff - i * 32).toString(16).repeat(3);
            ctx.fillRect(this.x + deltaX, this.y + deltaY + this.h / 5 * i, this.w - deltaX * 2, this.h / 5 - deltaY * 2);

            const shape = stack[i];
            // if (this.main.data.x === "w65") console.log(stack, shape);
            const node = new Mino(this.main, shape);
            const template = node.template(0);
            const [minY, maxY] = ((array) => [Math.min(...array), Math.max(...array)])(template.shape.map(([x, y]) => y));
            const delta = maxY - minY + 1;
            const x = this.x + this.w / 2 - (node.size / 2) * this.sizeX;
            const y = this.y + (this.h / this.length) * i + (this.h / this.length) / 2 - (minY + delta / 2) * this.sizeY; //(delta / 2) * this.sizeY// - deltaY / 2;
            for (const [offsetX, offsetY] of template.shape) {
                ctx.fillStyle = node.hex;
                ctx.fillRect(x + this.sizeX * offsetX + deltaX, y + this.sizeY * offsetY + deltaY, this.sizeX - deltaX * 2, this.sizeY - deltaY * 2);
            }
        }
    }
}

class HoldPanel extends Panel {
    constructor(main) {
        super(main, 5, 5);
        this.holding = null;
        this.held = false;
    }

    get x() {
        return super.x - this.WIDTH * super.sizeX;
    }

    get w() {
        return this.main.field.sizeX * this.WIDTH;
    }

    get h() {
        return this.main.field.sizeY * this.HEIGHT;
    }

    hold() {
        if (this.held) return;
        const { field } = this.main;
        if (!field.node) return;

        this.held = true;
        field.hide();
        if (this.holding) {
            const node = this.holding;

            this.holding = field.node;

            field.node = node;
        }
        else {
            this.holding = field.node;

            if (this.main.stack.length < Mino.rules.size) {
                const keys = [...Mino.rules.keys()];
                for (let i = keys.length - 1; i > 0; i--) {
                    let j = Math.floor(Math.random() * (i + 1));
                    [keys[i], keys[j]] = [keys[j], keys[i]];
                }
                this.main.stack.push(...keys);
            }

            const shape = this.main.stack.shift();
            setTimeout(() => this.main.display());

            field.node = new Mino(this.main, shape);
        }

        field.nodeX = Math.floor(field.WIDTH / 2 - field.node.size / 2);
        field.nodeY = 0;
        field.nodeRot = 0;
        while (!field.outside(field.nodeX, field.nodeY - 1, field.nodeRot)) field.nodeY--;
        field.draw();
    }

    display() {
        super.display();
        const { ctx } = Main;
        const [deltaX, deltaY] = [this.sizeX / 15, this.sizeY / 15];
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(this.x + deltaX, this.y + deltaY, this.w - deltaX * 2, this.h - deltaY * 2);

        if (!this.holding) return;
        const { holding } = this;
        const template = holding.template(0);
        const [minY, maxY] = ((array) => [Math.min(...array), Math.max(...array)])(template.shape.map(([x, y]) => y));
        const delta = maxY - minY + 1;
        const x = this.x + this.w / 2 - (holding.size / 2) * this.sizeX;
        const y = this.y + this.h / 2 - (minY + delta / 2) * this.sizeY; //(delta / 2) * this.sizeY// - deltaY / 2;
        for (const [offsetX, offsetY] of template.shape) {
            ctx.fillStyle = holding.hex;
            ctx.fillRect(x + this.sizeX * offsetX + deltaX, y + this.sizeY * offsetY + deltaY, this.sizeX - deltaX * 2, this.sizeY - deltaY * 2);
        }
    }
}

class ScorePanel extends Panel {
    #value = 0;

    constructor(main) {
        super(main, 5, 5);
    }

    get x() {
        return super.x + super.w;
    }

    get y() {
        return this.main.next.y + this.main.next.h;
    }

    get w() {
        return this.main.field.sizeX * this.WIDTH;
    }

    get h() {
        return this.main.field.sizeY * this.HEIGHT;
    }

    set value(value) {
        this.#value = Math.min(value, 99990);
        this.main.display();
    }

    get value() {
        return this.#value;
    }

    display() {
        super.display();
        const { ctx } = Main;
        const [deltaX, deltaY] = [this.sizeX / 15, this.sizeY / 15];
        ctx.lineWidth = (deltaX + deltaY) / 2;
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(this.x + deltaX, this.y + deltaY, this.w - deltaX * 2, this.h - deltaY * 2);

        const text = String(this.value).padStart(5, "0").split("").join(" ");
        ctx.fillStyle = "#ffffff";
        ctx.font = `${this.sizeX * 1.15}px tetris`;
        ctx.fillText(text, this.x + this.w / 14, this.y + this.h * (4 / 7));
    }
}

class Mino {
    /**
     * @param {Game} main
     * @param {string} shape
     */
    constructor(main, shape) {
        const { hex, size, templates } = Mino.getRule(shape);
        this.main = main;
        this.shape = shape;
        this.hex = hex;
        this.size = size;
        this.templates = templates;
    }

    template(rot) {
        return this.templates[(400000 - rot) % 4];
    }

    static setRule(shape, data, templates = []) {
        const { size, hex } = data;
        this.rules.set(shape, { size, hex, templates });
    }

    static getRule(shape) {
        if (!shape) console.trace(shape);
        const rule = Mino.rules.get(shape);
        if (!rule) throw Error(`${shape} MINO is invalid.`);
        return rule;
    }

    /**
     * @typedef {object} Rule
     * @property {number} size
     * @property {string} hex
     * @property {{ shape: [x: number, y: number][], right: [x: number, y: number][], left: [x: number, y: number][] }[]} templates
     */
    /** @type {Map<string, Rule>} */
    static rules = new Map();
}