// const config = {
//     sizeX: 10,
//     sizeY: 20,
//     noneStyle: "#000000",
//     nodeSize: 20,
//     addPoint: 100
// }

// class Tetris {
//     constructor() {
//         this.condition = null;
//         /** @type {Mino[]} */
//         this.stack = [];
//         this.field = Array.from({ length: config.sizeX }, () => Array.from({ length: config.sizeY }, () => ({ hex: "none", state: false })));
//     }

//     async start() {
//         this.canvas = document.getElementById("canvas");
//         if (!(this.canvas instanceof HTMLCanvasElement)) return

//         this.canvas.width = config.nodeSize * config.sizeX;
//         this.canvas.height = config.nodeSize * config.sizeY;

//         this.ctx = this.canvas.getContext("2d");
//         if (!this.ctx) return;
        
//         const next = new NextPanel(this);

//         while (true) {
//             if (this.stack.length <= 5) {
//                 const nodes = Object.keys(Mino.nodes).sort(() => Math.random() - 0.5);
//                 this.stack.push(...nodes.map((node) => new Mino(this, node)))
//             }
//             const node = this.stack.shift();
//             console.log(node.type);

//             next.drawField();
//             const flag = await this.control(node);
//             if (!flag) {
//                 this.finish();
//                 return;
//             }
            
//             const data = Array.from({ length: config.sizeY }, () => 0);
//             const lines = [];
//             for (let x = 0; x < config.sizeX; x++) {
//                 for (let y = 0; y < config.sizeY; y++) {
//                     const { state } = this.getPoint(x, y);
//                     if (state) {
//                         data[y]++;
//                         if (data[y] === config.sizeX) lines.push(y);
//                     }
//                 }
//             }
//             await this.deleteLine(lines);
               
//             console.log("continue");
//         }
//     }

//     finish() {
//         this.condition = null;
//         console.log("GameOver!");
//     }

//     /** @param {Mino} mino  */
//     async control(mino) {
//         if (this.condition != null) return true;

//         return new Promise(async (resolve) => {
//             const x = Math.floor(config.sizeX / 2), y = 0;
//             this.condition = mino;
//             this.condition.x = x;
//             this.condition.y = y;
//             this.condition.normalize();
//             if (this.condition.collision()) {
//                 console.log("collision");
//                 this.condition.draw(this.x, this.y, true);
//                 resolve(false);
//             } else {
//                 console.log("start");
//                 await this.condition.start();
//                 resolve(true);
//             }
//         });
//     }

//     drawField() {
//         for (let x = 0; x < config.sizeX; x++) {
//             for (let y = 0; y < config.sizeY; y++) {
//                 const { hex } = this.getPoint(x, y);
//                 this.ctx.fillStyle = hex == "none" ? config.noneStyle : hex;
//                 this.ctx.fillRect(config.nodeSize * x + 1, config.nodeSize * y + 1, config.nodeSize - 2, config.nodeSize - 2);
//             }
//         }
//     }

//     async deleteLine(lines) {
//         if (lines.length === 0) return;

//         for (let i = 0; i < 4; i++) {
//             await new Promise((resolve) => {
//                 setTimeout(() => {
//                     for (let x = 0; x < config.sizeX; x++) for (const y of lines)
//                         this.setPoint(x, y, { hex: i % 2 === 0 ? "#ffffff" : "#000000", state: false });
//                     resolve();
//                 }, 20);
//             })
//             this.drawField();
//         }
        
//         return new Promise((resolve) => {
//             const nextField = [...this.field];
//             setTimeout(() => {
//                 for (let x = 0; x < config.sizeX; x++) for (const y of lines) {
//                     this.setPoint(x, y, { hex: "none", state: false });
//                     for (let ty = y - 1; ty >= 0; ty--) {
//                         const point = this.getPoint(x, ty);
//                         if (point.state) {
//                             nextField[x][ty] = { hex: "none", state: false };
//                             nextField[x][ty + 1] = point;
//                         }
//                     }
//                 }
//                 this.field = nextField;
//                 this.drawField();
//                 resolve();
//             }, 100);
//         });
//     }

//     setPoint(x, y, data = {}) {
//         const { hex = null, state = null } = data;
//         if (this.field[x]?.[y]) {
//             if (hex !== null) this.field[x][y].hex = hex;
//             if (state !== null) this.field[x][y].state = state;
//         } 
//     }

//     /** @returns {{ hex: string, state: boolean }} */
//     getPoint(x, y) {
//         let point = { hex: "none", state: false };
//         if (this.field[x]?.[y]) point = this.field[x][y];
//         return point;
//     }
// }

// class Mino {
//     /** @type {Tetris} */
//     #tetris;

//     #templateIndex = 0;

//     #templates = [];

//     constructor(tetris, type) {
//         const { hex, templates } = Mino.nodes[type];
//         this.#tetris = tetris;
//         this.type = type;
//         this.hex = hex;
//         this.#templates = templates;
//         this.x = 0;
//         this.y = 0;
//         this.end = () => void 0;
//     }

//     get template() {
//         return this.#templates[this.#templateIndex];
//     }
    
//     get min() {
//         const min = [Infinity, Infinity];
//         for (const [x, y] of this.getPoints()) {
//             if (min[0] > x) min[0] = x;
//             if (min[1] > y) min[1] = y;
//         }
//         return min;
//     }

//     get max() {
//         const max = [-Infinity, -Infinity];
//         for (const [x, y] of this.getPoints()) {
//             if (max[0] < x) max[0] = x;
//             if (max[1] < y) max[1] = y;
//         }
//         return max;
//     }

//     getPoints() {
//         return this.template.map(([offsetX, offsetY]) => [this.x + offsetX, this.y + offsetY]);
//     }

//     start() {
//         return new Promise((resolve) => {
//             this.draw(this.x, this.y, false);
//             const interval = setInterval(() => {
//                 const flag = this.move("down");
//                 if (!flag) this.end();
//             }, 700);

//             this.end = () => {
//                 this.#tetris.condition = null;
//                 clearInterval(interval);
//                 resolve();
//             }
//         });
//     }

//     reflesh() {
//         this.normalize();
//         for (const [offsetX, offsetY] of this.template) {
//             this.#tetris.setPoint(this.x + offsetX, this.y + offsetY, { hex: "none", state: false });
//         }
//         this.#tetris.drawField();
//     }

//     draw(x = this.x, y = this.y, state = true) {
//         this.x = x;
//         this.y = y;
       
//         this.normalize();
//         for (const [x, y] of this.getPoints()) {
//             this.#tetris.setPoint(x, y, { hex: this.hex, state });
//         }
//         this.#tetris.drawField();
//     }

//     move(direct) {
//         this.reflesh();
//         const x = this.x, y = this.y;
//         const [offsetX, offsetY] = ({ "up": [0, -1], "down": [0, 1], "left": [-1, 0], "right": [1, 0] })[direct];
        
//         this.x += offsetX;
//         this.y += offsetY;

//         if (!this.valid()) {
//             this.x = x;
//             this.y = y;
//             this.draw(this.x, this.y, true);
//             return false;
//         }
//         else {
//             this.normalize();
//             this.draw(this.x, this.y, false);
//             return true;
//         }
//     }

//     spin(rotate) {
//         this.reflesh();
//         const index = this.#templateIndex;
        
//         this.#templateIndex =
//             rotate === "right" ? (index < this.#templates.length - 1 ? index + 1 : 0) :
//             rotate === "left" ? (index > 0 ? index - 1 : this.#templates.length - 1) : 0;
        
//         this.normalize();
//         if (this.type === "I") {
//             if (this.collision()) {
//                 this.#templateIndex = index;
//                 this.draw(this.x, this.y, true);
//                 return false;
//             }
//             else {
//                 this.draw(this.x, this.y, false);
//                 return true;
//             }
//         }
//         else {

//         }
//     }

//     drop() {
//         let flag = true;
//         while (flag) flag = this.move("down");
//         this.end();
//     }

//     normalize() {
//         const [minX, minY] = this.min, [maxX, maxY] = this.max;
//         if (minX < 0) this.x -= minX;
//         if (maxX > config.sizeX - 1) this.x -= (maxX - (config.sizeX - 1));
//         if (minY < 0) this.y -= minY;
//         if (maxY > config.sizeY - 1) this.y -= (maxY - (config.sizeY - 1));
//     }

//     outside(x = this.x, y = this.y) {
//         return this.template.some(([tx, ty]) => x + tx < 0 || x + tx > config.sizeX - 1 || y + ty < 0 || y + ty > config.sizeY - 1);
//     }

//     collision(x = this.x, y = this.y) {
//         return this.template.some(([tx, ty]) => {
//             const { state } = this.#tetris.getPoint(x + tx, y + ty);
//             return state;
//         });
//     }

//     valid(x = this.x, y = this.y) {
//         return !this.outside(x, y) && !this.collision(x, y); 
//     }

//     static nodes = {
//         "I": {
//             "hex": "#348fca",
//             "templates": [
//                 [[-1, -1], [0, -1], [1, -1], [2, -1]],
//                 [[0, 1], [0, 0], [0, -1], [0, -2]],
//                 [[-1, 0], [0, 0], [1, 0], [2, 0]],
//                 [[1, 1], [1, 0], [1, -1], [1, -2]]
//             ]
//         },
//         "O": {
//             "hex": "#e7bd22",
//             "templates": [
//                 [[0, 0], [0, -1], [1, 0], [1, -1]]
//             ]
//         },
//         "S": {
//             "hex": "#2aa55d",
//             "templates": [
//                 [[-1, 0], [0, 0], [0, -1], [1, -1]],
//                 [[0, -1], [0, 0], [1, 0], [1, 1]],
//                 [[-1, 1], [0, 1], [0, 0], [1, 0]],
//                 [[-1, -1], [-1, 0], [0, 0], [0, 1]]
//             ]
//         },
//         "Z": {
//             "hex": "#da4b3c",
//             "templates": [
//                 [[-1, -1], [0, -1], [0, 0], [1, 0]],
//                 [[0, 1], [0, 0], [1, 0], [1, -1]],
//                 [[-1, 0], [0, 0], [0, 1], [1, 1]],
//                 [[-1, 1], [-1, 0], [0, 0], [0, -1]]
//             ]
//         },
//         "J": {
//             "hex": "#246eab",
//             "templates": [
//                 [[-1, 0], [0, 0], [1, 0], [1, -1]],
//                 [[0, -1], [0, 0], [0, 1], [1, 1]],
//                 [[-1, 1], [-1, 0], [0, 0], [1, 0]],
//                 [[-1, -1], [0, -1], [0, 0], [0, 1]]
//             ]
//         },
//         "L": {
//             "hex": "#dc7a23",
//             "templates": [
//                 [[-1, -1], [-1, 0], [0, 0], [1, 0]],
//                 [[0, 1], [0, 0], [0, -1], [1, -1]],
//                 [[-1, 0], [0, 0], [1, 0], [1, 1]],
//                 [[-1, 1], [0, 1], [0, 0], [0, -1]]
//             ]
//         },
//         "T": {
//             "hex": "#824597",
//             "templates": [
//                 [[-1, 0], [0, 0], [1, 0], [0, -1]],
//                 [[0, -1], [0, 0], [0, 1], [1, 0]],
//                 [[-1, 0], [0, 0], [1, 0], [0, 1]],
//                 [[0, -1], [0, 0], [0, 1], [-1, 0]]
//             ]
//         }
//     }
// }

// class NextPanel {
//     /** @type {Tetris} */
//     #tetris

//     constructor(tetris) {
//         this.#tetris = tetris;
//         this.canvas = document.getElementById("next-canvas");
//         if (!(this.canvas instanceof HTMLCanvasElement)) throw Error("'canvas' must be canvas element");

//         this.amount = 5;
//         this.size = 10;
//         this.canvas.width = this.size * 5 * 1.4;
//         this.canvas.height = this.size * 5 * (this.amount + 1);

//         this.ctx = this.canvas.getContext("2d");
//         if (!this.ctx) throw Error("'ctx' is not found");
//     }

//     drawField() {
//         const c = this.canvas.width / 2;
//         this.ctx.fillStyle = config.noneStyle;
//         this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
//         // this.ctx.fillStyle = "#ffffff";
//         // this.ctx.fillRect(c, 0, 1, this.canvas.height);

//         const nodes = this.#tetris.stack.slice(0, this.amount);
//         for (let i = 0; i < this.amount; i++) {
//             const node = nodes[i];
//             const deltaX = node.max[0] - node.min[0] + 1;
//             for (const [x, y] of node.template) {
//                 const space = this.canvas.height / (this.amount + 1);
//                 const scale = i === 0 ? this.size * 1.4 : this.size;
//                 this.ctx.fillStyle = i <= 1 ? node.hex : "#eeeeee";
//                 this.ctx.fillRect(c - scale / (deltaX % 2 === 0 ? 1 : 2) + x * scale + 1, (space * (i + 1)) + y * scale + 1, scale - 2, scale - 2);
//             }
//         }
//     }
// }

// const tetris = new Tetris();
// document.addEventListener("DOMContentLoaded", () => {
//     tetris.start();
// });

// document.addEventListener("keydown", (ev) => {
//     const { key } = ev;

//     if (tetris.condition == null) return;
//     if (key === "ArrowUp") {
//         tetris.condition.spin("right");
//     }
//     if (key === "ArrowDown") {
//         tetris.condition.move("down");
//     }
//     if (key === "ArrowLeft") {
//         tetris.condition.move("left");
//     }
//     if (key === "ArrowRight") {
//         tetris.condition.move("right");
//     }

//     if (key === "x") {
//         tetris.condition.spin("left");
//     }
//     if (key === "z") {
//         tetris.condition.spin("right");
//     }

//     if (key === " ") {
//         tetris.condition.drop();
//     }
//     console.log(ev);
// });