import { EmbedField, Message } from "discord.js";
import Command, { CommandContext } from "../../lib/structures/Command.js";
import { formatPosition, setPages } from "../../lib/utils/functions.js";

export default abstract class LeaderboardCommand extends Command {
    public constructor(context: CommandContext) {
        super(context, {
            name: "Leaderboard",
            aliases: ["lb", "levels", "ranks", "lvls"],
            permissions: {
                commands_channel: true,
            },
            description: "View all member levels in the guild.",
            detailedDescription: {
                usage: "[page: number]",
            },
        });
    }

    public override run = async (message: Message, args: number[]) => {
        const fields: EmbedField[] = [];

        const levels = await this.context.db.levels.findMany({
            where: {
                guildId: message.guild!.id,
            },
        });
        if (!levels) return message.reply("This guild has no level data.");

        levels.sort((a, b) => {
            if (a.level === b.level) return b.xp - a.xp;
            else return b.level - a.level;
        });

        for (var i = 0; i < levels.length; i++) {
            const user = await this.context.client.users.fetch(levels[i].memberId).catch(() => null);
            if (!user) continue;

            fields.push({
                name: `Member: ${user.username} \`(${levels[i].memberId})\` (${formatPosition(i + 1)})`,
                value: `Currently\n> **Level:** \`${levels[i].level}\`\n> **XP:** \`${levels[i].xp}\``,
                inline: false,
            });
        }

        let page: number = (args[1] || 1) - 1;

        const pages = setPages(fields);
        if (!pages[page]) page = 0;

        const embed = pages[page]
            .setColor(0xd1daf9)
            .setAuthor({
                name: `${this.context.client.user!.tag} (${this.context.client.user!.id})`,
                iconURL: this.context.client.user!.displayAvatarURL(),
            })
            .setTitle(`Leaderboard for ${message.guild!.name}.`)
            .setTimestamp();

        if (pages.length >= 2)
            embed.setFooter({
                text: `Page ${page + 1} of ${pages.length}.`,
            });

        return message.channel.send({ embeds: [embed] });
    };
}
