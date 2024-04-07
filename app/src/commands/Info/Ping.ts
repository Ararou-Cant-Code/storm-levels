import Command, { CommandContext } from "../../lib/structures/Command.js";
import { DurationFormatter } from "@sapphire/time-utilities";
import Context from "../../lib/structures/Context.js";

export default abstract class PingCommand extends Command {
    public constructor(context: CommandContext) {
        super(context, {
            slashCapable: true,
            name: "Ping",
            permissions: {
                commands_channel: true,
            },
            description: "Get bot latency.",
        });
    }

    public override run = async (ctx: Context) => {
        const msg = await ctx.reply("Pinging...");
        return msg.edit(
            `Pong! Took \`${Math.round(
                (msg.editedTimestamp || msg.createdTimestamp) - (ctx.editedTimestamp || ctx.createdTimestamp)
            )}ms\` to respond. Websocket: \`${
                this.context.client.ws.ping
            }ms\`. Uptime: \`${new DurationFormatter().format(this.context.client.uptime!)}\``
        );
    };
}
