import { EmbedBuilder, StringMappedInteractionTypes, type EmbedField, type Guild } from "discord.js";

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
