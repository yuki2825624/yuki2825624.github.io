// @ts-check

// class Game {
//     constructor(x, y, w, h) {
//         this.stack = [];
//         this.field = new FieldPanel(this, x, y, w, h);
//         this.next = new NextPanel(this, x + this.field.w, y, this.field.sizeX * 5, this.field.sizeY * 15);
//         this.hold = new HoldPanel(this, x - this.field.sizeX * 5, y, this.field.sizeX * 5, this.field.sizeY * 5);
//     }

//     async start() {
//         await this.field.start();
//     }

//     display() {
//         this.field.display();
//         this.next.display();
//         this.hold.display();
//     }

//     resize(x, y, w, h) {
//         this.field.x = x;
//         this.field.y = y;
//         this.field.w = w;
//         this.field.h = h;
//         this.next.x = x + this.field.w;
//         this.next.y = y;
//         this.next.w = this.field.sizeX * 5;
//         this.next.h = this.field.sizeY * 15;
//         this.hold.x = x - this.field.sizeX * 5;
//         this.hold.y = y;
//         this.hold.w = this.field.sizeX * 5;
//         this.hold.h = this.field.sizeY * 5;
//         this.display();
//     }

//     end() {
//         this.field.end();
//     }
// }

// class FieldPanel {
//     /** @type {Game} */
//     #game;

//     WIDTH = 10;

//     HEIGHT = 20;

//     /** @type {(ev: KeyboardEvent) => void} */
//     keyDown = () => void 0;

//     constructor(game, x, y, w, h) {
//         this.#game = game;
//         this.x = x;
//         this.y = y;
//         this.w = w;
//         this.h = h;
//         this.tiles = Array.from({ length: this.HEIGHT }, (_, i) => Array.from({ length: this.WIDTH }, (_, j) => new FieldBlock(this, j, i)));
//         this.node = null;
//         this.active = false;

//         /** @type {() => void} */
//         this.end = () => void 0;
//     }

//     get sizeX() {
//         return this.w / this.WIDTH;
//     }

//     get sizeY() {
//         return this.h / this.HEIGHT;
//     }

//     async start() {
//         this.active = true;
//         while (this.active) {
//             console.log("test");
//             await this.fall();
//             this.#game.display();
//         }
//     }

//     display(state = false) {
//         const { ctx } = Main;

//         const [deltaX, deltaY] = [this.sizeX / 15, this.sizeY / 15];
//         ctx.fillStyle = "#444444";
//         ctx.fillRect(this.x - deltaX, this.y - deltaY, this.w + deltaX * 2, this.h + deltaY * 2);

//         if (this.node) {
//             const { node } = this;
//             const { template } = node;
//             // console.log(node.shape, `(${node.x}, ${node.y})`, `(${this.x}, ${this.y})`);
//             for (const [offsetX, offsetY] of template.shape) {
//                 const x = Math.round((node.x + this.sizeX * offsetX - this.x) / this.sizeX);
//                 const y = Math.round((node.y + this.sizeY * offsetY - this.y) / this.sizeY);
//                 // console.log(offsetX, offsetY, (node.x - this.x) / this.sizeX, (node.y - this.y) / this.sizeY, x, y);
//                 console.log(state);
//                 this.tiles[y][x] = new FieldBlock(this, x, y, { hex: node.hex, state });
//             }
//         }

//         for (let y = 0; y < this.tiles.length; y++) {
//             for (let x = 0; x < this.tiles[y].length; x++) {
//                 const tile = this.tiles[y][x];
//                 tile.display();
//             }
//         }
//     }

//     fall() {
//         return new Promise((resolve) => {
//             if (this.node) return resolve(0);

//             const keys = [...Mino.rules.keys()];
//             for (let i = keys.length - 1; i > 0; i--) {
//                 let j = Math.floor(Math.random() * (i + 1));
//                 [keys[i], keys[j]] = [keys[j], keys[i]];
//             }

//             if (this.#game.stack.length < keys.length) {
//                 this.#game.stack.push(...keys);
//             }

//             const start = Date.now();
//             const shape = this.#game.stack.shift();
//             const node = new Mino(this.#game, shape);
//             node.x = this.x + Math.ceil(this.WIDTH / 2 - node.size / 2) * this.sizeX;
//             node.y = this.y;
//             this.node = node;
//             setTimeout(() => this.#game.display(), 10);

//             let flag = false;
//             do {
//                 const y = node.y - 1;
//                 flag = !this.outside({ y });
//                 if (flag) node.y = y;
//             } while (flag);

//             if (!this.valid()) {
//                 this.active = false;
//                 return;
//             }

//             const move = () => {
//                 const flag = this.move("down");
//                 if (flag) this.display(); else this.end();
//             }

//             // move();
//             const i = setInterval(move, 700);

//             this.end = async () => {
//                 this.end = () => void 0;
//                 this.display(true);
//                 this.node = null;
//                 await this.checkLines();
//                 clearInterval(i);
//                 resolve(Date.now() - start);
//             }
//         });
//     }

//     checkLines() {
//         return new Promise(async (resolve) => {
//             const lines = Array.from({ length: this.tiles.length }, (_, line) => line)
//                 .filter((line) => this.tiles[line].every((tile) => tile.state));

//             if (lines.length > 0) {
//                 const tiles = [...this.tiles];

//                 for (let i = 0; i < 4; i++) {
//                     await new Promise((resolve) => {
//                         setTimeout(() => {
//                             for (const line of lines) {
//                                 this.tiles[line] = this.tiles[line].map((_, x) => new FieldBlock(this, x, line, { hex: i % 2 == 0 ? "#fff" : "#000", state: true }));
//                             }
//                             this.display();
//                             resolve(null);
//                             console.log("TEST", i);
//                         }, i > 0 ? 50 : 0);
//                     });
//                 }

//                 for (const line of lines) {
//                     for (let x = 0; x < tiles[line].length; x++) {
//                         tiles[line][x] = new FieldBlock(this, x, line, { hex: "#111111", state: false });
//                     }
//                     for (let y = line - 1; y >= 0; y--) {
//                         for (let x = 0; x < tiles[y].length; x++) {
//                             const tile = tiles[y][x];
//                             if (!tile.state) continue;
//                             tiles[y][x] = new FieldBlock(this, x, y, { hex: "#111111", state: false });
//                             tiles[y + 1][x] = new FieldBlock(this, x, y + 1, { hex: tile.hex, state: tile.state });
//                         }
//                     }
//                 }
//                 this.tiles = tiles;
//                 this.display();
//             }
//             resolve(null);
//         });
//     }

//     outside(data = {}) {
//         if (!this.node) return true;

//         const { node } = this;
//         const { x = node.x, y = node.y, dirct = node.direction } = data;
//         const template = node.templates[dirct];
//         return template.shape.some(([offsetX, offsetY]) => {
//             const tx = Math.round((x + this.sizeX * offsetX - this.x) / this.sizeX);
//             const ty = Math.round((y + this.sizeY * offsetY - this.y) / this.sizeY);
//             return tx < 0 || tx > (this.WIDTH - 1) || ty < 0 || ty > (this.HEIGHT - 1);
//         });
//     }

//     collision(data = {}) {
//         if (!this.node) return true;

//         const { node } = this;
//         const { x = node.x, y = node.y, dirct = node.direction } = data;

//         const template = node.templates[dirct];
//         return template.shape.some(([offsetX, offsetY]) => {
//             const tx = Math.round((x + this.sizeX * offsetX - this.x) / this.sizeX);
//             const ty = Math.round((y + this.sizeY * offsetY - this.y) / this.sizeY);
//             const tile = this.tiles[ty]?.[tx];
//             //console.log(tile);
//             return this.tiles[ty]?.[tx]?.state;
//         });
//     }

//     valid(data = {}) {
//         return !(this.outside(data) || this.collision(data));
//     }

//     hide(template) {
//         if (!this.node) return;

//         const { node } = this;
//         if (!template) template = node.template;
//         for (const [offsetX, offsetY] of template.shape) {
//             const x = Math.round((node.x + this.sizeX * offsetX - this.x) / this.sizeX);
//             const y = Math.round((node.y + this.sizeY * offsetY - this.y) / this.sizeY);
//             this.tiles[y][x] = new FieldBlock(this, x, y, { hex: "#111111", state: false });
//         }
//     }

//     move(dirct) {
//         if (!this.node) return false;

//         const { node } = this;
//         switch (dirct) {
//             case "up": {
//                 const y = node.y - this.sizeY;
//                 if (this.valid({ y })) {
//                     this.hide();
//                     node.y = y;
//                     this.display();
//                     return true;
//                 }
//                 return false;
//             }
//             case "down": {
//                 const y = node.y + this.sizeY;
//                 if (this.valid({ y })) {
//                     this.hide();
//                     node.y = y;
//                     this.display();
//                     return true;
//                 }
//                 return false;
//             }
//             case "right": {
//                 const x = node.x + this.sizeX;

//                 if (this.valid({ x })) {
//                     this.hide();
//                     node.x = x;
//                     this.display();
//                     return true;
//                 }
//                 return false;
//             }
//             case "left": {
//                 const x = node.x - this.sizeY;
//                 if (this.valid({ x })) {
//                     this.hide();
//                     node.x = x;
//                     this.display();
//                     return true;
//                 }
//                 return false;
//             }
//             default: {
//                 return false;
//             }
//         }
//     }

//     flip(dirct) {
//         if (!this.node) return;

//         const { node } = this;
//         const { template } = node;
//         if (dirct === "right") {
//             for (const [offsetX, offsetY] of template.right) {
//                 const x = node.x + this.sizeX * offsetX;
//                 const y = node.y + this.sizeY * offsetY;
//                 const direction = node._direction + 1;
//                 if (this.valid({ x, y, dirct: direction % node.templates.length })) {
//                     this.hide(template);
//                     node.x = x;
//                     node.y = y;
//                     node.direction = direction;
//                     this.display();
//                     break;
//                 }
//             }
//         }
//         if (dirct === "left") {
//             for (const [offsetX, offsetY] of template.left) {
//                 const x = node.x + this.sizeX * offsetX;
//                 const y = node.y + this.sizeY * offsetY;
//                 const direction = node._direction - 1;
//                 // console.log(direction);
//                 if (this.valid({ x, y, dirct: direction % node.templates.length })) {
//                     this.hide(template);
//                     node.x = x;
//                     node.y = y;
//                     node.direction = direction;
//                     this.display();
//                     break;
//                 }
//             }
//         }
//     }
// }

// class FieldBlock {
//     /** @type {FieldPanel} */
//     #field;

//     constructor(field, x, y, data = {}) {
//         const { state = false, hex = "#111111" } = data;
//         this.#field = field;
//         this._x = x;
//         this._y = y;
//         this.state = state;
//         this.hex = hex;
//     }

//     get x() {
//         return this.#field.x + this.#field.sizeX * this._x;
//     }

//     get y() {
//         return this.#field.y + this.#field.sizeY * this._y;
//     }

//     display() {
//         const { ctx } = Main;

//         const [deltaX, deltaY] = [this.#field.sizeX / 20, this.#field.sizeY / 20];

//         ctx.fillStyle = this.hex;
//         ctx.fillRect(this.x + deltaX, this.y + deltaY, this.#field.sizeX - deltaX * 2, this.#field.sizeY - deltaY * 2);
//     }
// }

// class NextPanel {
//     /** @type {Game} */
//     #game;

//     WIDTH = 5;

//     HEIGHT = 15;

//     constructor(game, x, y, w, h) {
//         this.#game = game;
//         this.x = x;
//         this.y = y;
//         this.w = w;
//         this.h = h;
//         this.length = 5;
//     }

//     get sizeX() {
//         return this.w / this.WIDTH;
//     }

//     get sizeY() {
//         return this.h / this.HEIGHT;
//     }

//     display() {
//         const { ctx } = Main;

//         const stack = this.#game.stack;
//         const [deltaX, deltaY] = [this.sizeX / 15, this.sizeY / 15];
//         ctx.fillStyle = "#444444";
//         ctx.fillRect(this.x - deltaX, this.y - deltaY, this.w + deltaX * 2, this.h + deltaY * 2);
//         for (let i = 0; i < this.length; i++) {
//             ctx.fillStyle = "#" + (0xff - i * 32).toString(16).repeat(3);
//             ctx.fillRect(this.x + deltaX, this.y + deltaY + this.h / 5 * i, this.w - deltaX * 2, this.h / 5 - deltaY * 2);

//             console.log(stack);
//             const shape = stack[i];
//             const node = new Mino(this.#game, shape);
//             node.x = this.x + this.w / 2 - (node.size / 2) * this.sizeX;
//             node.y = this.y + this.h / 5 * i + (this.h / 5) / 2 - this.sizeY * (node.size > 3 ? 3 / 2 : 1);

//             const { template } = node;
//             for (const [offsetX, offsetY] of template.shape) {
//                 ctx.fillStyle = node.hex;
//                 ctx.fillRect(node.x + offsetX * this.sizeX + deltaX, node.y + offsetY * this.sizeY + deltaY, this.sizeX - deltaX * 2, this.sizeY - deltaY * 2);
//             }
//         }
//     }
// }

// class HoldPanel {
//     /** @type {Game} */
//     #game;

//     WIDTH = 5;

//     HEIGHT = 5;

//     constructor(game, x, y, w, h) {
//         this.#game = game;
//         this.x = x;
//         this.y = y;
//         this.w = w;
//         this.h = h;
//     }

//     get sizeX() {
//         return this.w / this.WIDTH;
//     }

//     get sizeY() {
//         return this.h / this.HEIGHT;
//     }


//     display() {
//         const { ctx } = Main;

//         const [deltaX, deltaY] = [this.sizeX / 15, this.sizeY / 15];
//         ctx.fillStyle = "#444444";
//         ctx.fillRect(this.x - deltaX, this.y - deltaY, this.w + deltaX * 2, this.h + deltaY * 2);
//         ctx.fillStyle = "#dddddd";
//         ctx.fillRect(this.x + deltaX, this.y + deltaY, this.w - deltaX * 2, this.h - deltaY * 2);
//     }
// }

// class Mino {
//     /** @type {Game} */
//     #game;

//     _direction = 400000;

//     constructor(game, shape) {
//         const rule = Mino.rules.get(shape);
//         if (!rule) throw Error(`${shape} shape is invalid.`);
//         const { size, hex, templates } = rule;

//         this.#game = game;
//         this.shape = shape;
//         this.x = 0;
//         this.y = 0;

//         this.size = size;
//         this.hex = hex;
//         this.templates = templates;

//     }

//     set direction(dirct) {
//         this._direction = dirct;
//     }

//     get direction() {
//         return this._direction % this.templates.length;
//     }

//     get template() {
//         return this.templates[this.direction];
//     }

//     static rule(shape, data, templates = []) {
//         const { size, hex } = data;
//         this.rules.set(shape, { size, hex, templates });
//     }

//     /**
//      * @typedef {object} Rule
//      * @property {number} size
//      * @property {string} hex
//      * @property {{ shape: [x: number, y: number][], right: [x: number, y: number][], left: [x: number, y: number][] }[]} templates
//      */
//     /** @type {Map<string, Rule>} */
//     static rules = new Map();
// }