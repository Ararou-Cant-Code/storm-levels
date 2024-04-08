import { EmbedField, SlashCommandBuilder } from "discord.js";
import Command, { CommandContext } from "../../lib/structures/Command.js";
import { formatPosition, setPages } from "../../lib/utils/functions.js";
import Args from "../../lib/structures/Args.js";
import Context from "../../lib/structures/Context.js";

export default abstract class LeaderboardCommand extends Command {
    public constructor(context: CommandContext) {
        super(context, {
            slashCapable: true,
            data: new SlashCommandBuilder()
                .setName("leaderboard")
                .setDescription("View all member levels in the guild.")
                .addNumberOption((option) =>
                    option
                        .setName("page")
                        .setDescription("The page to view. Defaults to the first page.")
                        .setRequired(false)
                ),
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

    public override run = async (ctx: Context, args: Args) => {
        const fields: EmbedField[] = [];

        const levels = await this.context.db.levels.findMany({
            where: {
                guildId: ctx.guild!.id,
            },
        });
        if (!levels) return ctx.reply("This guild has no level data.");

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

        let page = ctx.isInteraction()
            ? (ctx.options.getNumber("page", false) || 1) - 1
            : (await args.getNumberIndex(1).catch(() => 1)) - 1;

        const pages = setPages(fields);
        if (!pages[page]) page = 0;

        const embed = pages[page]
            .setColor(0xd1daf9)
            .setAuthor({
                name: `${this.context.client.user!.tag} (${this.context.client.user!.id})`,
                iconURL: this.context.client.user!.displayAvatarURL(),
            })
            .setTitle(`Leaderboard for ${ctx.guild!.name}.`)
            .setTimestamp();

        if (pages.length >= 2)
            embed.setFooter({
                text: `Page ${page + 1} of ${pages.length}.`,
            });

        return ctx.reply({ embeds: [embed] });
    };
}
