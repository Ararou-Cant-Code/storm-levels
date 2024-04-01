import { Collection, Client as DiscordClient, ClientOptions as DiscordClientOptions } from "discord.js";
import { ClientOptions, GuildConfigOptions } from "../utils/constants.js";
import { readdirSync } from "node:fs";
import Listener from "./Listener.js";
import Command from "./Command.js";
import { PrismaClient } from "@prisma/client";

export class Client extends DiscordClient {
    public db = new PrismaClient();

    public developerId?: string = "840213882147831879";
    public defaultPrefix?: string = "!";

    public commandResponseCooldowns = new Set();
    public commandCooldowns = new Set();
    public levelCooldowns = new Set();

    public commands: Collection<String, Command> = new Collection();
    public aliases: Map<string, string> = new Map();

    public guildConfigs: Map<string, GuildConfigOptions> = new Map().set(
        "1220036404969472010", // The Storm.
        {
            channels: {
                commands: "1220049907411456102",
            },
            roles: {
                allStaff: "1220038799590162472",
                level_roles: {
                    [5]: "1223653433798688818",
                    [10]: "1223653545920827432",
                    [20]: "1223653706604744765",
                    [25]: "1223653872472690730",
                    [30]: "1223653958770360420",
                    [45]: "1223654085849256068",
                    [50]: "1223654238240899132",
                    [60]: "1223654397850943640",
                    [65]: "1223654499260960878",
                },
            },
            permissions: {
                staff: {
                    roles: ["1220038799590162472"],
                    nodes: ["ping.command"],
                },
            },
        }
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
                    db: this.db,
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
