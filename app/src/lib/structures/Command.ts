import { PermissionsBitField } from "discord.js";
import { Client } from "./Client.js";

interface CommandOptions {
    name: string;
    aliases?: string[];
    description?: string;
    detailedDescription?: { usage?: string; examples?: string[] };
    permissions?: { node?: string; user?: PermissionsBitField[]; client?: PermissionsBitField[] };
}

export default abstract class Command {
    public client: Client;
    public directory?: string;

    public options: CommandOptions;

    public name: string;
    public aliases?: string[];

    public abstract run: (...args: any[]) => unknown;

    public constructor(client: Client, options: CommandOptions) {
        this.client = client;
        this.options = options;
        this.name = options.name;
        this.aliases = options.aliases;
    }
}
