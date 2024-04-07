import Command, { CommandContext } from "../../lib/structures/Command.js";
import Args from "../../lib/structures/Args.js";
import Context from "../../lib/structures/Context.js";

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

    public override run = async (ctx: Context, args: Args) => {
        const flag = args.getFlags("hi", "h", "test", "t");

        return ctx.reply(`Flag: ${flag ? "Yes" : "No"}`);
    };
}
