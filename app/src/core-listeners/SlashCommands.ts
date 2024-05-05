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
        if (!interaction.isCommand()) return; // Return nothing if the interaction is not a command.

        const blacklistedData = await this.client.db.blacklists.findFirst({
            where: {
                guildId: interaction.guild!.id,
                userId: interaction.user.id,
            },
        });
        if (blacklistedData && blacklistedData.types.length && blacklistedData.types.includes("COMMANDS_BLACKLISTED"))
            return;

        // Get the command class from the slashCommands collection
        const command = this.client.slashCommands.get(interaction.commandName);

        // Set the command context.
        command!.context.executed = {
            message: interaction,
            user: interaction.user,
            userRoles: interaction.member!.roles.cache.map((r) => r.id),
            channel: interaction.channel!,
            guild: interaction.guild!,
        };

        try {
            // Test and run the command.
            return command!.test(command!, command!.context, getCtx(interaction));
        } catch (error) {
            return this.client.logger.error(error as any); // Somebody please scream at me to actually implement this soon.
        }
    };
}
