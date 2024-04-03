import { Events } from "discord.js";
import { Client } from "../lib/structures/Client.js";
import Listener from "../lib/structures/Listener.js";

export default abstract class ClientReadyListener extends Listener {
    public constructor(client: Client) {
        super(client, {
            name: "Debug",
            event: Events.Debug,
        });
    }

    public override run = async (debug: string) => {
        this.client.logger.info(debug);
    };
}
