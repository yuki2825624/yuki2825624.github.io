// class GameScene extends Scene {
//     constructor() {
//         super();
//     }
    
//     display() {
//         super.display();

//         const { ctx } = scene;
    
//         ctx.font = `${scene.width(17)}px tetris`;
//         ctx.strokeStyle = "#ffffff"
//         ctx.strokeText("GAME", scene.width(5), scene.height(40));
    
//         ctx.font = `${scene.width(7)}px tetris`;
//         ctx.fillStyle = "#ffffff";
//         ctx.fillText("END", scene.width(65), scene.height(80));
    
//         ctx.strokeStyle = "#ffffff";
//         ctx.strokeRect(scene.width(64.5), scene.height(71.5), scene.width(27), scene.width(7.5));
//     }
// }

// const gameScene = new GameScene();

// gameScene.addButton(() => ({
//     begin: [ scene.width(64.5), scene.height(71.5) ],
//     width: scene.width(27),
//     height: scene.width(7.5)
// }), () => {
//     scene.display("main");
// });

// window.addEventListener("resize", () => {
//     if (!scene.is("game")) return;
//     scene.display("game");
// });

// // window.addEventListener("mousedown", (ev) => {
// //     if (!scene.is("game")) return;
// //     const { x, y } = ev;
// //     GameScene.emitButton(x, y);
// // });

// scene.set("game", gameScene);