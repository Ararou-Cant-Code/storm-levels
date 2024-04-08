import { Events, REST, Routes } from "discord.js";
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
        await this.handleSlashCommands();

        this.client.logger.info(`Signed in as ${this.client.user!.tag} (${this.client.user!.id})`);
    };

    private handleSlashCommands = async () => {
        const rest = new REST().setToken(process.env.TOKEN!);
        const commands = this.client.slashCommands
            .filter((c) => c.options.slashCapable)
            .map((c) => c.options.data)
            .filter((c) => c)
            .map((c) => c!.toJSON());

        const data = (await rest.put(Routes.applicationCommands(this.client.application!.id), {
            body: commands,
        })) as unknown[];
        return this.client.logger.info(`[/] Reloaded ${data.length} slash commands.`);
    };
}
