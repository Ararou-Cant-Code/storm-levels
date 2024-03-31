import { Events, Message } from "discord.js";
import { Client } from "../lib/structures/Client.js";
import Listener from "../lib/structures/Listener.js";

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default abstract class MessageCommandsListener extends Listener {
    public constructor(client: Client) {
        super(client, {
            name: "MessageCommands",
            event: Events.MessageCreate,
        });
    }

    public override run = async (message: Message) => {
        if (message.author.bot) return;

        const prefixRegex = new RegExp(`^(<@!?${this.client.user!.id}>|${escapeRegex(this.client.defaultPrefix!)})\s*`);
        if (!prefixRegex.test(message.content)) return;

        const [matchedPrefix] = message.content.match(prefixRegex)!;

        const args = message.content.slice(matchedPrefix!.length).trim().split(/ +/g);

        const command = args.shift()!.toLowerCase();

        const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command)!);
        if (!cmd) return;

        try {
            cmd.context.executed = {
                message,
                user: message.author,
                userRoles: message.member!.roles.cache.map((r) => r.id),
                channel: message.channel!,
                guild: message.guild!,
            };

            return cmd.test(cmd, cmd.context, message, args);
        } catch (error: any) {
            console.log(error);
            return message.reply("An error occured!");
        }
    };
}
