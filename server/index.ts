import {serve} from "bun";
import {Database} from "bun:sqlite";

import {runMigrations} from "./database/migrations";
import {runSeeds} from "./database/seeds";
import {getDb} from "./database/crud.ts";

import websocketHandlers from "./websocket/handler.ts"

const db:Database = getDb();

runMigrations(db);
runSeeds(db);

serve({
    port: 3000,
    fetch(req, server) {
        if (server.upgrade(req)) return; // Handle WebSocket upgrade
        // Throw an error if it's not a WebSocket request
        return new Response("WebSocket upgrade required", { status: 426 }); // 426 Upgrade Required
    },
    // @ts-ignore
    websocket: websocketHandlers,
});
