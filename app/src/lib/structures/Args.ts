import { type Message } from "discord.js";
import Command, { type CommandContext } from "./Command.js";
import { getMember, getUser } from "../utils/functions.js";
import { type ArgumentStream } from "@sapphire/lexure";

class ArgumentError extends Error {
    public name: string = "ArgumentError";
    public message: string;

    public constructor(message: string) {
        super(message);
        this.message = message;
    }
}

export default class Args {
    public readonly command: Command | null;
    public readonly commandName: string;
    public readonly commandContext: CommandContext;
    public readonly commandArgs: string[];

    protected readonly parser: ArgumentStream;

    public readonly message: Message;

    public constructor(
        command: Command,
        commandContext: CommandContext,
        commandArgs: string[],
        parser: ArgumentStream,
        message: Message
    ) {
        this.command = command;
        this.commandName = command.name;
        this.commandContext = commandContext;
        this.commandArgs = commandArgs;

        this.parser = parser;

        this.message = message;
    }

    public getAll = async () => {
        if (!this.commandArgs.length) throw new ArgumentError("The raw array is likely empty.");

        return this.commandArgs.join(" ");
    };

    public getIndex = async (index: number) => {
        if (!this.commandArgs.length) throw new ArgumentError("The raw array is likely empty.");

        return this.commandArgs[index];
    };

    public getNumberIndex = async (index: number) => {
        if (!this.commandArgs.length) throw new ArgumentError("The provided raw data is invalid.");
        if (Number.isNaN(this.commandArgs[index])) throw new ArgumentError("The provided raw data is invalid.");

        return Number(this.commandArgs[index]);
    };

    public getFlags = (...keys: readonly string[]) => {
        if (!this.command!.options.flags!) return false; // Command has no flags defined in options.

        return this.parser.flag(...keys);
    };

    public returnMemberFromIndex = async (index: number) => {
        if (!this.commandArgs.length) throw new ArgumentError("The raw array is likely empty.");

        const member = await getMember(this.message.guild!, this.commandArgs[index]);
        if (!member) throw new ArgumentError("Failed to fetch member.");

        return member;
    };

    public returnUserFromIndex = async (index: number) => {
        if (!this.commandArgs.length) throw new ArgumentError("The raw array is likely empty.");

        const user = await getUser(this.commandContext.client, this.commandArgs[index]);
        if (!user) throw new ArgumentError("Failed to fetch user.");

        return user;
    };
}
