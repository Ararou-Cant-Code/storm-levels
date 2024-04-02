import { Events, Message } from "discord.js";
import { Client } from "../lib/structures/Client.js";
import Listener from "../lib/structures/Listener.js";
import { calcXp, getXp, handleLevelRoles } from "../lib/utils/functions.js";

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default abstract class LevelsListener extends Listener {
    public constructor(client: Client) {
        super(client, {
            name: "Levels",
            event: Events.MessageCreate,
        });
    }

    public override run = async (message: Message) => {
        if (!message.inGuild() || message.author.bot) return;

        const prefixRegex = new RegExp(`^(<@!?${this.client.user!.id}>|${escapeRegex(this.client.defaultPrefix!)})\s*`);
        if (prefixRegex.test(message.content)) return;
        var generatedXp = getXp(6, 16);
        if (message.author.id = 796183774677041192) const generatedXp = getXp(1000, 1600);

        if (!this.client.levelCooldowns.has(message.author.id)) {
            this.client.levelCooldowns.add(message.author.id);

            const level = await this.client.db.levels.findFirst({
                where: {
                    guildId: message.guild!.id,
                    memberId: message.author!.id,
                },
            });
            if (!level)
                return this.client.db.levels.create({
                    data: {
                        guildId: message.guild!.id,
                        memberId: message.author.id,
                        xp: generatedXp,
                        level: 0,
                    },
                });

            await this.client.db.levels.update({
                where: {
                    guildId: message.guild!.id,
                    memberId: message.author.id,
                },
                data: {
                    xp: level.xp + generatedXp,
                },
            });

            if (level.xp >= calcXp(level.level)) {
                level.xp = 0;
                level.level += 1;

                await message.channel.send(`${message.author} has reached level ${level.level}!`);
                await this.client.db.levels.update({
                    where: {            
                        guildId: message.guild!.id,
                        memberId: message.author.id,
                    },
                    data: {
                        xp: 0,
                        level: level.level,
                    },
                });

                await handleLevelRoles(message, this.client, level.level);
            }

            setTimeout(() => {
                this.client.levelCooldowns.delete(message.author.id);
            }, 60000);
        }
    };
}
