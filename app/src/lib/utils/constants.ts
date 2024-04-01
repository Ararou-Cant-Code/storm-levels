import { ClientOptions as DiscordClientOptions, GatewayIntentBits, Partials } from "discord.js";

export const ClientOptions: ClientOptions = {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message],

    defaultPrefix: "!",
    developer: "840213882147831879",
};

export interface ClientOptions extends DiscordClientOptions {
    defaultPrefix?: string | null;
    developer?: string | string[] | null;
}

export interface GuildConfigOptions {
    permissions: {
        staff: { roles: string[]; nodes: string[]; users: string[] };
    };
    channels: { commands: string; prohibited: string[] };
    roles: { level_roles: LevelRoles; prohibited: string[]; allStaff: string };
}

interface LevelRoles {
    [5]: string;
    [10]: string;
    [20]: string;
    [25]: string;
    [30]: string;
    [45]: string;
    [50]: string;
    [60]: string;
    [65]: string;
}
