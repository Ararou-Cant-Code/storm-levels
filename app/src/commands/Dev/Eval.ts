import { Message, codeBlock } from "discord.js";
import Command, { CommandContext } from "../../lib/structures/Command.js";
import { inspect } from "node:util";
import Args from "../../lib/structures/Args.js";
import { ArgumentFailed } from "../../lib/utils/errors.js";

export default abstract class EvalCommand extends Command {
    public constructor(context: CommandContext) {
        super(context, {
            name: "Eval",
            permissions: { dev: true },
            description: "Eval a line of code.",
            detailedDescription: {
                usage: "<code: String>",
            },
        });
    }

    public override run = async (message: Message, args: Args) => {
        if (message.author.id !== "840213882147831879") throw "Bad.";

        const code = await args.getAll().catch(() => null);
        if (!code) throw new ArgumentFailed("code");

        try {
            const evaluated = await eval(code);
            const result = inspect(evaluated);

            if (result.length >= 2000)
                return message.reply({
                    content: "Evaluated result is too long for discord...",
                    files: [{ name: "result.js", attachment: Buffer.from(result) }],
                });

            return message.reply(codeBlock("js", typeof evaluated !== "string" ? result : evaluated));
        } catch (error: any) {
            return message.reply(codeBlock("js", error));
        }
    };
}
