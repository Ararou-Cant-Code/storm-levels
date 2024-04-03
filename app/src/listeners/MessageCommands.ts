import { Events, Message } from "discord.js";
import { Client } from "../lib/structures/Client.js";
import Listener from "../lib/structures/Listener.js";
import Args from "../lib/structures/Args.js";
import { Parser, PrefixedStrategy, Lexer, ArgumentStream } from "@sapphire/lexure";

const parser = new Parser(new PrefixedStrategy(["--", "-", "—"], ["=", ":"]));
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

        const rawArgs = message.content.slice(matchedPrefix!.length).trim().split(/ +/g);

        const command = rawArgs.shift()!.toLowerCase();

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

            // Handle ArgumentStream, args and then test and run the command.
            const stream = new ArgumentStream(parser.run(cmd.lexer.run(message.content)));
            const args = new Args(cmd, cmd.context, rawArgs, stream, message);
            await cmd.test(cmd, cmd.context, message, args);
        } catch (e) {
            // No need to do any actual reporting on this one, only used for permission failure.
            if ((e as { name: string }).name.includes("CommandRunFailure")) return;

            if (
                (e as { name: string }).name.includes("ArgumentFailed") ||
                (e as { name: string }).name.includes("GenericFailure") ||
                (e as { name: string }).name.includes("PublicFailure")
            )
                return message.reply(`> ${(e as { message: string }).message}`);

            return console.log(`whoops error: ${e}`);
        }
    };
}
