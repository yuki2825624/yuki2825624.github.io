const { Server, WebSocket } = require("ws");

class Client {
    constructor(options = {}) {
        this.ws = new Server(options);
        this.ws.on("connection", (socket, request) => {
            this.connection = socket;

            this.connection.on("message", (data, isBinary) => {
                if (isBinary) throw Error("data must not be binary");
                let packet;
                try { packet = JSON.parse(data) } catch (e) {};
                if (!packet) return;
                console.log("recive packet:", packet);
            });
            
            console.log("WebSocket Connection!!");
        });

        this.ws.on("close", () => {
            console.log("WebSocket Closed.");
        });
    }
}

const client = new Client({ port: 30000 });


process.on("uncaughtExc)eption", (error, origin) => console.error(`[${origin}]`, error));