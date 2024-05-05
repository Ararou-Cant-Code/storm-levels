import Command, { CommandContext } from "../../lib/structures/Command.js";
import Args from "../../lib/structures/Args.js";
import Context from "../../lib/structures/Context.js";
import { ArgumentFailed, GenericFailure } from "../../lib/utils/errors.js";

export default abstract class UnblacklistCommand extends Command {
    public constructor(context: CommandContext) {
        super(context, {
            name: "Unblacklist",
            flags: ["levels", "lvls", "commands", "cmds"],
            permissions: {
                dev: true,
            },
            description: "Unblacklist a user from either levels or commands.",
        });
    }

    public override run = async (ctx: Context, args: Args) => {
        const user = await args.returnMemberFromIndex(0).catch(() => null);
        if (!user) throw new ArgumentFailed("user");

        const levelsFlag = args.getFlags("levels", "lvls");
        const commandsFlag = args.getFlags("commands", "cmds");

        if (!levelsFlag && !commandsFlag) throw new ArgumentFailed("flag");

        const reason = await args.getRest(2).catch(() => "No reason provided.");

        const isBlacklisted = await this.context.client.db.blacklists.findFirst({
            where: {
                guildId: ctx.guild!.id,
                userId: user.id,
                types: {
                    has: levelsFlag ? "LEVELS_BLACKLISTED" : "COMMANDS_BLACKLISTED",
                },
            },
        });
        if (!isBlacklisted) throw new GenericFailure("This user is not blacklisted from the specified system.");

        if (levelsFlag) {
            await this.context.client.db.blacklists.update({
                where: {
                    guildId: ctx.guild!.id,
                    userId: user.id,
                },
                data: {
                    types: {
                        set: isBlacklisted.types.filter((t) => t !== "LEVELS_BLACKLISTED"),
                    },
                },
            });
            return ctx.message.channel.send(`${user} \`(${user.id})\` has been **unblacklisted** for \`${reason}\`.`);
        } else if (commandsFlag) {
            await this.context.client.db.blacklists.update({
                where: {
                    guildId: ctx.guild!.id,
                    userId: user.id,
                },
                data: {
                    types: {
                        set: isBlacklisted.types.filter((t) => t !== "COMMANDS_BLACKLISTED"),
                    },
                },
            });
            return ctx.message.channel.send(`${user} \`(${user.id})\` has been **unblacklisted** for \`${reason}\`.`);
        }
    };
}
