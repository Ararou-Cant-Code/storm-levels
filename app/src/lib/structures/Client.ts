import { Collection, Client as DiscordClient, ClientOptions as DiscordClientOptions } from "discord.js";
import { ClientOptions, GuildConfigOptions } from "../utils/constants.js";
import { readdirSync } from "node:fs";
import Listener from "./Listener.js";
import Command from "./Command.js";

export class Client extends DiscordClient {
    public defaultPrefix?: string = "!";
    public levelCooldowns = new Set();

    public commands: Collection<String, Command> = new Collection();
    public aliases: Map<string, string> = new Map();

    public guildConfigs: Map<string, GuildConfigOptions> = new Map().set(
        "1220036404969472010", // The Storm.
        {}
    );

    public constructor(options: DiscordClientOptions & ClientOptions) {
        super(options);
    }

    private handleCommands = async () => {
        const cmdPath = readdirSync("dist/commands");

        for (const dir of cmdPath) {
            const files = readdirSync(`dist/commands/${dir}`).filter((f) => f.endsWith(".js"));
            for (const file of files) {
                const commandImported = (await import(`../../commands/${dir}/${file}`)).default;

                const command: Command = new commandImported(this);
                command.name = command.name.toLowerCase();

                command.context = {
                    client: this,
                    directory: dir,
                };

                this.commands.set(command.name.toLowerCase(), command);

                if (command.aliases)
                    command.aliases.forEach((alias) =>
                        this.aliases.set(alias.toLowerCase(), command.name.toLowerCase())
                    );

                console.log(`Loaded command ${command.name}`);
            }
        }
    };

    private handleListeners = async () => {
        const files = readdirSync("dist/listeners").filter((f) => f.endsWith(".js"));

        for (const file of files) {
            const importedListener = (await import(`../../listeners/${file}`)).default;

            const listener: Listener = new importedListener(this);

            listener.once
                ? this.once(listener.options.event, (...args) => void listener.run!(...args))
                : this.on(listener.options.event, (...args) => void listener.run!(...args));
            console.log(`Loaded listener ${listener.name}`);
        }
    };

    public start = async (token: string) => {
        await this.handleListeners();
        await this.handleCommands();

        await this.login(token).catch((e) => {
            throw new Error("Failed to start client: " + e);
        });
    };
}
