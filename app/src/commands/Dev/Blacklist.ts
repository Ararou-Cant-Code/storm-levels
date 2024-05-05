import Command, { CommandContext } from "../../lib/structures/Command.js";
import Args from "../../lib/structures/Args.js";
import Context from "../../lib/structures/Context.js";
import { ArgumentFailed, GenericFailure } from "../../lib/utils/errors.js";

export default abstract class BlacklistCommand extends Command {
    public constructor(context: CommandContext) {
        super(context, {
            name: "Blacklist",
            flags: ["levels", "lvls", "commands", "cmds"],
            permissions: {
                dev: true,
            },
            description: "Blacklist a user from either levels or commands.",
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
        if (isBlacklisted) throw new GenericFailure("This user is already blacklisted from the specified system.");

        if (levelsFlag) {
            await this.context.client.db.blacklists.upsert({
                where: {
                    guildId: ctx.guild!.id,
                    userId: user.id,
                },
                update: {
                    types: {
                        push: "LEVELS_BLACKLISTED",
                    },
                },
                create: {
                    guildId: ctx.guild!.id,
                    userId: user.id,

                    reason,
                    types: { set: ["LEVELS_BLACKLISTED"] },
                },
            });
            return ctx.message.channel.send(`${user} \`(${user.id})\` has been **blacklisted** for \`${reason}\`.`);
        } else if (commandsFlag) {
            await this.context.client.db.blacklists.upsert({
                where: {
                    guildId: ctx.guild!.id,
                    userId: user.id,
                },
                update: {
                    types: {
                        push: "COMMANDS_BLACKLISTED",
                    },
                },
                create: {
                    guildId: ctx.guild!.id,
                    userId: user.id,

                    reason,
                    types: { set: ["COMMANDS_BLACKLISTED"] },
                },
            });
            return ctx.message.channel.send(`${user} \`(${user.id})\` has been **blacklisted** for \`${reason}\`.`);
        }
    };
}
