import { type APIEmbed, Colors as Colours, type Message, time, codeBlock, WebhookClient } from "discord.js";
import { type Client } from "../structures/Client.js";
import Command, { type CommandContext } from "../structures/Command";
import { captureException } from "@sentry/node";

export default class SentryHandler {
    public readonly context: SentryHandlerContext;
    public readonly options: SentryHandlerOptions;

    public constructor(context: SentryHandlerContext, options: SentryHandlerOptions) {
        this.context = context;
        this.options = options;
    }

    public run = async (
        type: SentryHandlerRunTypes,
        error: any,
        messageCommandValues?: { command: Command; commandContext: CommandContext; message: Message }
    ) => {
        switch (type) {
            case "MessageCommand":
                await this.runOnMessageCommand(error, messageCommandValues!);
                break;
            default:
                break;
        }
    };

    public runOnMessageCommand = async (
        error: any,
        messageCommandValues: {
            command: Command;
            commandContext: CommandContext;
            message: Message;
        }
    ) => {
        const errorId = captureException(error);
        const errorEmbed: APIEmbed = {
            color: Colours.Red,
            author: {
                name: `${this.context.client.user!.tag} (${this.context.client.user!.id})`,
                icon_url: this.context.client.user!.displayAvatarURL(),
            },
            title: `An error occured in command \`${messageCommandValues.command.name}\` at ${time(new Date(), "F")}`,
            description: `${codeBlock("typescript", error)}`,
            fields: [
                {
                    name: "Issued By",
                    value: `${messageCommandValues.message.author} - ${messageCommandValues.message.author.username} \`(${messageCommandValues.message.author.id})\``,
                    inline: true,
                },
                {
                    name: "Occured In (Go to)",
                    value: `${messageCommandValues.message.url} \`(${messageCommandValues.message.channel!.id})\``,
                    inline: true,
                },
            ],
            footer: { text: `Go to https://sentry.io/${errorId} for more information.` },
        };

        const webhook = new WebhookClient({ url: process.env.SENTRY_DISCORD_LOG_WEBHOOK! });
        await webhook.send({ embeds: [errorEmbed] });

        this.context.client.logger.error(error);
        return { errorId, error };
    };
}

interface SentryHandlerContext {
    client: Client;
}

interface SentryHandlerOptions {
    sendEmbed?: boolean;
    sendLogToConsole?: boolean;
}

type SentryHandlerRunTypes = "ChatInputCommand" | "MessageCommand" | "CoreListener" | "Listener";
