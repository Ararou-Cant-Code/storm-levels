import { Message } from "discord.js";
import Command, { CommandContext } from "../../lib/structures/Command.js";

export default abstract class PingCommand extends Command {
    public constructor(context: CommandContext) {
        super(context, {
            name: "Ping",
        });
    }

    public override run = async (message: Message) => {
        const msg = await message.channel.send("Pinging...");
        return msg.edit(
            `Pong! (Roundtrip took: ${Math.round(
                (msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)
            )}ms. Heartbeat: ${this.context.client.ws.ping}ms.)`
        );
    };
}
