import { type BaseInteraction, type ChatInputCommandInteraction, Events, type Message } from "discord.js";
import { Client } from "../lib/structures/Client.js";
import Listener from "../lib/structures/Listener.js";
import Context from "../lib/structures/Context.js";

const getCtx = function (wrappable: Message | BaseInteraction) {
    const ctx = Context.wrap(wrappable);
    return ctx;
};

export default abstract class ClientReadyListener extends Listener {
    public constructor(client: Client) {
        super(client, {
            name: "SlashCommands",
            event: Events.InteractionCreate,
        });
    }

    public override run = async (interaction: ChatInputCommandInteraction<"cached">) => {
        if (interaction.isCommand()) {
            const command = this.client.slashCommands.get(interaction.commandName);
            command!.context.executed = {
                message: interaction,
                user: interaction.user,
                userRoles: interaction.member!.roles.cache.map((r) => r.id),
                channel: interaction.channel!,
                guild: interaction.guild!,
            };
            return command!.test(command!, command!.context, getCtx(interaction));
        }
    };
}
