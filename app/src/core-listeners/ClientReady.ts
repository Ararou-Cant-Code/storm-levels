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
        this.client.logger.info(`Signed in as ${this.client.user!.tag} (${this.client.user!.id})`);
    };
}
