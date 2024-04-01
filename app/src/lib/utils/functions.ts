import { EmbedBuilder, Message, type EmbedField, type Guild } from "discord.js";
import { type CommandContext } from "../structures/Command.js";
import { Client } from "../structures/Client.js";

const levelThresholds = [5, 10, 20, 25, 30, 45, 50, 60, 65];

export const handleLevelRoles = async (message: Message, client: Client, newLevel: number) => {
    const levelRoles = client.guildConfigs.get(message.guild!.id)!.roles.level_roles as keyof object;

    const rolesBesideLevelRoles = message.member!.roles.cache.filter((r) => !r.name.startsWith("Level"));
    const levelRolesOnly = message.member!.roles.cache.filter((r) => r.name.startsWith("Level")).map((role) => role);

    for (const role of levelRolesOnly) {
        await message.member!.roles.remove(role).catch(() => null);
    }

    try {
        for (var i = 0; i < levelThresholds.length; i++) {
            // Add highest role available
            if (newLevel >= levelThresholds[i]) {
                const role = await message.guild!.roles.fetch(levelRoles[levelThresholds[i]]);
                await message.member!.roles.add(role!);

                // Remove lower roles
                for (var j = i - 1; j >= 0; j--) {
                    await message.member!.roles.remove(levelRoles[levelThresholds[j]]);
                }
            } else {
                break;
            }
        }
    } catch (error) {
        console.log(`Error when setting level roles: ${error}`);
    }
};

export const handleMessage = async (message: Message, context: CommandContext, content: string) => {
    if (context.client.commandResponseCooldowns.has(message.author.id)) return;

    await message.reply(content);

    context.client.commandResponseCooldowns.add(message.author.id);
    setTimeout(() => context.client.commandResponseCooldowns.delete(message.author.id), 15000);
};

export const handleCommandCooldowns = async (message: Message, context: CommandContext) => {
    if (context.client.commandCooldowns.has(message.author.id)) return;

    context.client.commandCooldowns.add(message.author.id);
    setTimeout(() => context.client.commandCooldowns.delete(message.author.id), 15000);
};

export function getXp(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const calcXp = (level: number) => 100 * level || 1;

export const getMember = async function (guild: Guild, mention: string) {
    if (!mention) return;
    if (mention.startsWith("<@") && mention.endsWith(">")) {
        mention = mention.slice(2, -1);
        if (mention.startsWith("!")) mention = mention.slice(1);
    }
    return guild.members.fetch(mention).catch(() => undefined);
};

export function setPages(embeds: EmbedField[]) {
    if (!embeds[0]) throw new Error("There are no embeds to paginate.");

    const pages = [];
    let max = 20;

    for (var i = 0; i < embeds.length; i += 20) {
        const data = embeds.slice(i, max);

        max += 20;

        const embed = new EmbedBuilder().addFields(data.map((e) => e));
        pages.push(embed);
    }

    return pages;
}

export function formatPosition(pos: number) {
    const emoji = {
        1: "🥇",
        2: "🥈",
        3: "🥉",
    };

    return emoji[pos as keyof object] || "#" + pos.toString();
}
