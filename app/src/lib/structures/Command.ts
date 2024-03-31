import { TextChannel, type Guild, type Message, type PermissionsBitField, type User, Channel } from "discord.js";
import { Client } from "./Client.js";
import { client } from "../../index.js";

interface CommandOptions {
    name: string;
    aliases?: string[];
    description?: string;
    detailedDescription?: { usage?: string; examples?: string[] };
    permissions?: { node?: string; user?: PermissionsBitField[]; client?: PermissionsBitField[] };
}

export interface CommandContext {
    client: Client;
    directory: string;

    executed?: {
        message: Message,
        user: User;
        guild: Guild;
        channel: Channel;
    };
}

export default abstract class Command {
    public context: CommandContext;

    public directory?: string;

    public options: CommandOptions;

    public name: string;
    public aliases?: string[];

    public abstract run: (...args: any[]) => unknown;

    public constructor(context: CommandContext, options: CommandOptions) {
        this.context = context ?? { client };
        this.options = options;
        this.name = options.name;
        this.aliases = options.aliases;
    }
}
