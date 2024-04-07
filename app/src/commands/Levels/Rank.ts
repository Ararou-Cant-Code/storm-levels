import { AttachmentBuilder } from "discord.js";
import Command, { CommandContext } from "../../lib/structures/Command.js";
import { BuiltInGraphemeProvider, Font, RankCardBuilder } from "canvacord";
import { calcXp } from "../../lib/utils/functions.js";
import Args from "../../lib/structures/Args.js";
import { GenericFailure } from "../../lib/utils/errors.js";
import Context from "../../lib/structures/Context.js";

export default abstract class RankCommand extends Command {
    public constructor(context: CommandContext) {
        super(context, {
            name: "Rank",
            aliases: ["level", "lvl", "rnk"],
            permissions: {
                commands_channel: true,
            },
            description: "View yours or another members rank.",
            detailedDescription: {
                usage: "[member: GuildMember]",
            },
        });
    }

    public override run = async (ctx: Context, args: Args) => {
        Font.loadDefault();

        const member = await args.returnMemberFromIndex(0).catch(() => ctx.member!);
        if (member.user.bot) throw new GenericFailure("That user is a bot.");

        const cardData = await this.context.client.db.cards.findFirst({
            where: {
                memberId: member.id,
                guildId: ctx.guild!.id,
            },
        });

        const levels = await this.context.client.db.levels.findFirst({
            where: {
                guildId: ctx.guild!.id,
                memberId: member.id,
            },
        });
        if (!levels) throw new GenericFailure("There is no levels for this server.");

        if (!levels.level && !levels.xp)
            return ctx.reply(`${member.id === ctx.author.id ? "You" : "They"} have no XP!`);

        let allLevels = await this.context.client.db.levels.findMany({
            where: {
                guildId: ctx.guild!.id,
            },
        });
        allLevels.sort((a, b) => {
            if (a.level === b.level) return b.xp - a.xp;
            else return b.level - a.level;
        });

        const memId = member!.user.id;
        const current = allLevels.findIndex((lvl) => lvl.memberId === memId) + 1;

        const rank = await new RankCardBuilder()
            .setStyles({
                progressbar: {
                    thumb: {
                        style: {
                            backgroundColor: "white",
                        },
                    },
                },
            })
            .setDisplayName(member.nickname ?? member.user.displayName)
            .setUsername("@" + member.user.username)
            .setAvatar(
                member!.user.displayAvatarURL({
                    forceStatic: true,
                })
            )
            .setOverlay(50)
            .setBackground(
                cardData ? cardData.background : "https://i.ibb.co/R9dNGQg/d0aed536fc9a360003d5ee26b9555d9f-1.png"
            )
            .setLevel(levels.level)
            .setRank(current)
            .setCurrentXP(levels.xp)
            .setRequiredXP(calcXp(levels.level))
            .setGraphemeProvider(BuiltInGraphemeProvider.Blobmoji)
            .build({ format: "png" });

        return ctx.reply({ files: [new AttachmentBuilder(rank)] });
    };
}
