import { AttachmentBuilder, Message } from "discord.js";
import Command, { CommandContext } from "../../lib/structures/Command.js";
import canva from "canvacord";
import { calcXp, getMember } from "../../lib/utils/functions.js";

export default abstract class RankCommand extends Command {
    public constructor(context: CommandContext) {
        super(context, {
            name: "Rank",
            aliases: ["level", "lvl", "rnk"],
            description: "View yours or another members rank.",
            detailedDescription: {
                usage: "[member: GuildMember]",
            },
        });
    }

    public override run = async (message: Message, args: string[]) => {
        const memberArgument = args[0] ?? message.author.id;

        const member = await getMember(message.guild!, memberArgument);
        if (!member) return message.reply("That member is not in this guild, or you provided an invalid member.");

        if (member.user.bot) return message.reply("That user is a bot.");

        const levels = await this.context.client.db.levels.findFirst({
            where: {
                guildId: message.guild!.id,
                memberId: member.id,
            },
        });
        if (!levels) return message.reply(`${member.id === message.author.id ? "You" : "They"} have no XP!`);

        if (!levels.level && !levels.xp)
            return message.reply(`${member.id === message.author.id ? "You" : "They"} have no XP!`);

        let allLevels = await this.context.client.db.levels.findMany({
            where: {
                guildId: message.guild!.id,
            },
        });
        allLevels.sort((a, b) => {
            if (a.level === b.level) return b.xp - a.xp;
            else return b.level - a.level;
        });

        const memId = member!.user.id;
        const current = allLevels.findIndex((lvl) => lvl.memberId === memId) + 1;

        const rank = await new canva.Rank()
            .setAvatar(member!.user.displayAvatarURL())
            .setLevel(levels.level)
            .setRank(current)
            .setCurrentXP(levels.xp)
            .setProgressBar("#ff4444", "COLOR")
            .setRequiredXP(calcXp(levels.level))
            .setUsername(member.user!.username)
            .setDiscriminator(member!.user.discriminator)
            .build();

        return message.reply({ files: [new AttachmentBuilder(rank)] });
    };
}
