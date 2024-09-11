// const config = {
//     sizeX: 10,
//     sizeY: 20
// }

// class Tetris {
//     constructor() {
//         this.active = false;
//         this.condition = null;
//         this.blocks = [];
//         this.stack = [];
//         document.addEventListener("DOMContentLoaded", () => {
//             this.canvas = document.getElementById("canvas");
//             if (!(this.canvas instanceof HTMLCanvasElement)) return;
//             this.ctx = this.canvas.getContext("2d");
//             this.active = true;
//             this.step = {
//                 x: this.canvas.width / config.sizeX,
//                 y: this.canvas.height / config.sizeY
//             }
//             this.start();
//         });
//     }

//     async start() {
//         while (true) {
//             const types = ["I", "O", "S", "Z", "J", "L", "T"].sort(() => Math.random() - 0.5 > 0);
//             for (const type of types) {
//                 if (!this.active) break;
//                 await tetris.node(type);
//             }
//         }
//     }

//     node(type) {
//         if (!this.active) return;
//         return new Promise(async (resolve) => {
//             if (this.condition != null) return;
            
//             const node = new Mino(this, type);
//             node.draw(Math.floor(config.sizeX / 2), 0);
//             this.condition = node;
            
//             await new Promise(async (resolve) => {
//                 while (true) {
//                     const flag = await new Promise((sub) => {
//                         setTimeout(() => {
//                             const flag = node.move("down");
//                             sub(flag);
//                             if (!flag) resolve();
//                         }, 700);
//                     });
//                     if (!flag) break;
//                 }
//             });
            
//             const template = node.templates[node.template].map(([tx, ty]) => [node.x + tx, node.y + ty]);
//             this.blocks.push(...template);
//             console.log(this.blocks);
//             for (let i = 0; i < config.sizeY; i++) {
//                 const detect = this.blocks.filter(([, by]) => by === i);
//                 if (detect.length === config.sizeX) {
//                     this.ctx.fillStyle = "#111111";
//                     this.ctx.fillRect(0, this.step.y * i, this.step.x * config.sizeX, this.step.y);
//                     this.blocks = this.blocks
//                         .filter(([, by]) => by !== i)
//                         // .map(([bx, by]) => [bx, by <= i ? by : by - 1]);
//                 }
//             }

//             this.condition = null;
//             resolve();
//         });
//     }

//     move(direct) {
//         if (!this.active) return;
//         if (this.condition != null) this.condition.move(direct);
//     }

//     spin(rotate) {
//         if (!this.active) return;
//         if (this.condition != null) this.condition.spin(rotate);
//     }

//     finish() {
//         console.log("GameOver!");
//         this.active = true;
//     }
// }

// class Mino {

//     /**
//      * @param {Tetris} tetris
//      */
//     constructor(tetris, type) {
//         const { hex, templates } = Mino.getInfo(type);
//         this.tetris = tetris;
//         this.type = type;
//         this.hex = hex;
//         this.template = 0;
//         this.templates = templates;
//         this.x = 0;
//         this.y = 0;
//         this.chunk = [];
//     }
    
//     get min() {
//         const template = this.templates[this.template];
//         return template.reduce(([tx, ty], [x, y]) => [tx > x ? x : tx, ty > y ? y : ty], [Infinity, Infinity]);
//     }

//     get max() {
//         const template = this.templates[this.template];
//         return template.reduce(([tx, ty], [x, y]) => [tx < x ? x : tx, ty < y ? y : ty], [-Infinity, -Infinity]);
//     }

//     draw(x, y) {
//         const template = this.templates[this.template];
        
//         if (!this.drawable(x, y)) {
//             if (y <= 0) this.tetris.finish();
//             return;
//         }

//         console.log("location", x, y, this.min, this.max);
//         if (x + this.min[0] < 0) x = 0 - this.min[0];
//         if (x + this.max[0] > config.sizeX - 1) x = config.sizeX - this.max[0] - 1;
//         if (y + this.min[1] < 0) y = 0 - this.min[1];
//         if (y + this.max[1] > config.sizeY - 1) y = config.sizeY - this.max[1] - 1;

//         const { step } = this.tetris;
//         for (const [tx, ty] of template) {
//             const [startX, startY] = [step.x * x + step.x * tx, step.y * y + step.y * ty];
//             tetris.ctx.fillStyle = this.hex;
//             tetris.ctx.fillRect(startX + 1, startY + 1, step.x - 2, step.y - 2);
//             this.chunk.push({ x: startX, y: startY });
//         }
        
//         // tetris.ctx.fillStyle = "#ffffff";
//         // tetris.ctx.fillRect(this.step.x * x + 1, this.step.y * y + 1, this.step.x - 2, this.step.y - 2);

//         this.x = x;
//         this.y = y;
//     }

//     reflesh() {
//         while (this.chunk.length > 0) {
//             const { x, y } = this.chunk.shift();
//             const { step } = this.tetris;
//             tetris.ctx.fillStyle = "#111111";
//             tetris.ctx.fillRect(x, y, step.x, step.y);
//         }
//     }

//     move(direct) {
//         const [offsetX, offsetY] = 
//             direct === "down" ? [0, 1] :
//             direct === "up" ? [0, -1] :
//             direct === "right" ? [1, 0] :
//             direct === "left" ? [-1, 0] : [0, 0];
//         const [x, y] = [this.x + offsetX, this.y + offsetY];
        
//         if (this.drawable(x, y)) {
//             this.reflesh();
//             this.draw(x, y);
//             return true;
//         }
//         else {
//             console.log("move failed");
//             return false;
//         }
//     }

//     spin(rotate) {
//         const temp = this.template;
//         if (rotate === "right") this.template = this.template < this.templates.length - 1 ? this.template + 1 : 0;
//         if (rotate === "left") this.template = this.template > 0 ? this.template - 1 : this.templates.length - 1; 

//         if (this.drawable(this.x, this.y)) {
//             this.reflesh();
//             this.draw(this.x, this.y);
//             return true;
//         }
//         else {
//             this.template = temp;
//             console.log("spin failed");
//             return false;
//         }
//     }

//     collision(x, y) {
//         const template = this.templates[this.template];
//         return tetris.blocks.some(([bx, by]) => template.some(([tx, ty]) => bx === x + tx && by === y + ty));
//     }

//     outside(x, y) {
//         return this.min[0] + x < 0 || this.max[0] + x >= config.sizeX || this.max[1] + y >= config.sizeY;
//     }

//     drawable(x, y) {
//         return !this.outside(x, y) && !this.collision(x, y);
//     }

//     static getInfo(type) {
//         if (!(type in this.#nodes)) throw Error(`Not found node: ${type}`);
//         return this.#nodes[type];
//     }

//     static #nodes = {
//         "I": {
//             "hex": "#348fca",
//             "templates": [
//                 [[0, 1], [0, 0], [0, -1], [0, -2]],
//                 [[-1, 0], [0, 0], [1, 0], [2, 0]],
//                 [[1, 1], [1, 0], [1, -1], [1, -2]],
//                 [[-1, -1], [0, -1], [1, -1], [2, -1]]
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

// const tetris = new Tetris();

// document.addEventListener("keydown", (ev) => {
//     const { key } = ev;
//     if (key === "ArrowUp") {

//     }
//     if (key === "ArrowDown") {
//         tetris.move("down");
//     }
//     if (key === "ArrowRight") {
//         tetris.move("right");
//     }
//     if (key === "ArrowLeft") {
//         tetris.move("left");
//     }
//     if (key === "x") {
//         tetris.spin("left");
//     }
//     if (key === "z") {
//         tetris.spin("right");
//     }
// });

