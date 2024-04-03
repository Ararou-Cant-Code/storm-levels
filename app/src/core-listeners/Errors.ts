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
        process.on("unhandledRejection", async (m: unknown) => {
            this.client.logger.error(m as string);
        });

        process.on("uncaughtException", async (m: unknown) => {
            this.client.logger.error(m as string);
        });

        process.on("uncaughtExceptionMonitor", async (m: unknown) => {
            this.client.logger.error(m as string);
        });

        this.client.on("error", async (m: unknown) => {
            this.client.logger.error(m as string);
        });

        this.client.on("listenerError", async (m: unknown) => {
            this.client.logger.error(m as string);
        });

        process.on("uncaughtException", async (m: unknown) => {
            this.client.logger.error(m as string);
        });
    };
}
