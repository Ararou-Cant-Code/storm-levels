import { Events } from "discord.js";
import { Client } from "../lib/structures/Client.js";
import Listener from "../lib/structures/Listener.js";

export default abstract class ClientReadyListener extends Listener {
    public constructor(client: Client) {
        super(client, {
            name: "ClientReady",
            event: Events.ClientReady,
        });
    }

    public override run = async () => {
        process.on("unhandledRejection", async (m) => {
            console.log(m);
        });

        process.on("uncaughtException", async (m) => {
            console.log(m);
        });

        process.on("uncaughtExceptionMonitor", async (m) => {
            console.log(m);
        });

        this.client.on("error", async (m) => {
            console.log(m);
        });

        this.client.on("listenerError", async (m) => {
            console.log(m);
        });

        process.on("uncaughtException", async (m) => {
            console.log(m);
        });
    };
}
