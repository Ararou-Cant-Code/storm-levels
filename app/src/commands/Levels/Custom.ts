import Command, { CommandContext } from "../../lib/structures/Command.js";
import Args from "../../lib/structures/Args.js";
import { ArgumentFailed, GenericFailure } from "../../lib/utils/errors.js";
import Context from "../../lib/structures/Context.js";

const subcommands = ["background-set", "progress-bar-set"];

export default abstract class CustomCommand extends Command {
    public constructor(context: CommandContext) {
        super(context, {
            name: "custom",
            detailedDescription: {
                usage: "background-set <url/hex: string> | progress-bar-set <colour: string>",
            },
            permissions: {
                trusted_member: true, // Level 20+ only
            },
            description: "Configure your own rank card.",
        });
    }

    public override run = async (ctx: Context, args: Args) => {
        const subcommand = await args.getIndex(0).catch(() => null);
        if (!subcommand) throw new GenericFailure("A subcommand is needed.");

        switch (subcommand) {
            case subcommands[0]:
                await this.backgroundSetRun(ctx, args);
                break;
            case subcommands[1]:
                await ctx.reply("This subcommand is not yet supported.");
                break;
            default:
                throw new GenericFailure(
                    `That is not a valid subcommand. Your options are \`${subcommands.join(", ")}\``
                );
        }
    };

    public backgroundSetRun = async (ctx: Context, args: Args) => {
        const background = await args.getIndex(1).catch(() => null);

        if (!background) throw new ArgumentFailed("rank-card-background");

        const data = await this.context.client.db.cards.upsert({
            create: {
                memberId: ctx.author.id,
                guildId: ctx.guild!.id,
                background: background,
            },
            where: {
                memberId: ctx.author.id,
                guildId: ctx.guild!.id,
            },
            update: {
                memberId: ctx.author.id,
                guildId: ctx.guild!.id,
                background: background,
            },
        });
        return ctx.reply(
            `Your rank card is now set to \`${data.background}\`. You can check it out now with the \`rank\` command!`
        );
    };
}
