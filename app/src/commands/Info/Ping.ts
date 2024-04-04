import { Message } from "discord.js";
import Command, { CommandContext } from "../../lib/structures/Command.js";
import { DurationFormatter } from "@sapphire/time-utilities";

export default abstract class PingCommand extends Command {
    public constructor(context: CommandContext) {
        super(context, {
            name: "Ping",
            permissions: {
                commands_channel: true,
            },
            description: "Get bot latency.",
        });
    }

    public override run = async (message: Message) => {
        const msg = await message.channel.send("Pinging...");
        return msg.edit(
            `Pong! Took \`${Math.round(
                (msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)
            )}ms\` to respond. Websocket: \`${
                this.context.client.ws.ping
            }ms\`. Uptime: \`${new DurationFormatter().format(this.context.client.uptime!)}\``
        );
    };
}
