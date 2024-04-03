import { Message } from "discord.js";
import Command, { CommandContext } from "../../lib/structures/Command.js";
import Args from "../../lib/structures/Args.js";

export default abstract class TesterCommand extends Command {
    public constructor(context: CommandContext) {
        super(context, {
            name: "Tester",
            flags: ["test"],
            permissions: {
                dev: true,
            },
            description: "funny testing stuff",
        });
    }

    public override run = async (message: Message, args: Args) => {
        const flag = args.getFlags("hi", "h", "test", "t");

        return message.channel.send(`Flag: ${flag ? "Yes" : "No"}`);
    };
}
