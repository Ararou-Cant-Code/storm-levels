import { Message } from "discord.js";
import { Client } from "../../lib/structures/Client.js";
import Command from "../../lib/structures/Command.js";

export default abstract class PingCommand extends Command {
    public constructor(client: Client) {
        super(client, {
            name: "Ping",
        });
    }

    public override run = async (message: Message) => {
        const msg = await message.channel.send("Pinging...");
        return msg.edit(
            `Pong! (Roundtrip took: ${Math.round(
                (msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)
            )}ms. Heartbeat: ${message.guild!.shard.ping}ms.)`
        );
    };
}
