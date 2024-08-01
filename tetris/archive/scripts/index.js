// // @ts-check

// const fieldX = 10;
// const fieldY = 20;
// const fieldHex = "#111111";
// const field = Array.from({ length: fieldX }, () => Array.from({ length: fieldY }), () => ({ hex: fieldHex, state: false }));
// const stack = [];

// class Tetris {
//     constructor() {
//         this.start();
//     }

//     get canvas() {
//         const canvas = document.getElementById("canvas");
//         if (canvas instanceof HTMLCanvasElement) return canvas;
//     }

//     get ctx() {
//         const ctx = this.canvas?.getContext("2d");
//         if (ctx) return ctx;
//     }

//     async start() {

//     }

//     setPoint(x, y, data = {}) {
//         const point = this.getPoint(x, y);
//         if (!point) return;

//         const { hex = point.hex, state = point.state } = data;
//         field[x][y] = { hex, state };
//     }

//     getPoint(x, y) {
//         const row = field[x];
//         if (row[y]) return row[y];
//     }
// }

// class Mino {
//     /** @type {Tetris} */
//     #tetris;

//     #templateIndex = 0;

//     #templates = [];

//     constructor(tetris, type) {
//         const { size, hex, templates } = Mino.#rules.get(type);
//         this.#tetris = tetris;
//         this.type = type;
//         this.size = size;
//         this.hex = hex;
//         this.#templates = templates;
//         this.#templateIndex = 0;
//         this.x = 0;
//         this.y = 0;
//     }

//     get template() {
//         return this.#templates[this.#templateIndex][0];
//     }

//     get offsets() {
//         return this.#templates[this.#templateIndex].slice(1, 2);
//     }

//     move(offset) {
//         const [ x, y ] = offset;
//         this.x += x;
//         this.y += y;
//     }

//     spin(rotate) {
//         if (rotate != "right" && rotate != "left") return;
//         const n = rotate === "left" ? 1 : 2;
//         const index =
//             rotate === "right" ? (this.#templateIndex < this.#templates.length - 1 ? this.#templateIndex + 1 : 0) :
//             rotate === "left" ? (this.#templateIndex > 0 ? this.#templateIndex - 1 : this.#templates.length - 1) : 0;
//         for (const offset of this.offsets[n]) for (const [x, y] of offset) {
//             if (this.valid())  {

//             }
//         }
//     }

//     outside(x, y) {
//         return this.template.some(([tx, ty]) => x + tx < 0 || x + tx > fieldX - 1 || y + ty < 0 || y + ty > fieldY - 1);
//     }

//     collision(x, y) {
//         return this.template.some(([tx, ty]) => this.#tetris.getPoint(x + tx, y + ty)?.state);
//     }

//     valid(x, y) {
//         return !this.outside(x, y) && !this.collision(x, y); 
//     }

//     static rule(type, data = {}, templates) {
//         console.log("Registered:", type);
//         const { length, size } = data;
//         this.#rules.set(type, { length, size, templates });
//     }

//     static getAll() {
//         return [...this.#rules.values()];
//     }

//     static getTypes() {
//         return [...this.#rules.keys()];
//     }

//     static #rules = new Map();
// }


// document.addEventListener("DOMContentLoaded", () => {
//     for (const input of document.getElementsByName("scene")) {
//         if (!(input instanceof HTMLInputElement)) continue;
//         const click = () => {
//             const id = input.getAttribute("data-scene");
//             if (!id) return;
//             const scene = document.getElementById(id);
//             if (!scene) return;
//             scene.style.display = input.checked ? "block" : "none";
//         }

//         click();
//         input.addEventListener("click", click);
//     }
// });

// document.addEventListener("mousemove", (ev) => {
//     console.log(ev);
// });