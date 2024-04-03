import { type Message } from "discord.js";
import Command, { type CommandContext } from "./Command.js";
import { getMember, getUser } from "../utils/functions.js";

class ArgumentError extends Error {
    public name: string = "ArgumentError";
    public message: string;

    public constructor(message: string) {
        super(message);
        this.message = message;
    }
}

export default class Args {
    public command: Command | null;
    public commandName: string;
    public commandContext: CommandContext;
    public message: Message;
    public listenerInput: string[];

    public constructor(command: Command, commandContext: CommandContext, message: Message, listenerInput: string[]) {
        this.commandName = command.name;
        this.commandContext = commandContext;
        this.message = message;

        this.command = command;
        this.listenerInput = listenerInput;
    }

    public getAll = async () => {
        if (!this.listenerInput.length) throw new ArgumentError("The raw array is likely empty.");

        return this.listenerInput.join(" ");
    };

    public getIndex = async (index: number) => {
        if (!this.listenerInput.length) throw new ArgumentError("The raw array is likely empty.");

        return this.listenerInput[index];
    };

    public getNumberIndex = async (index: number) => {
        if (!this.listenerInput.length) throw new ArgumentError("The provided raw data is invalid.");
        if (Number.isNaN(this.listenerInput[index])) throw new ArgumentError("The provided raw data is invalid.");

        return Number(this.listenerInput[index]);
    };

    public returnMemberFromIndex = async (index: number) => {
        if (!this.listenerInput.length) throw new ArgumentError("The raw array is likely empty.");

        const member = await getMember(this.message.guild!, this.listenerInput[index]);
        if (!member) throw new ArgumentError("Failed to fetch member.");

        return member;
    };

    public returnUserFromIndex = async (index: number) => {
        if (!this.listenerInput.length) throw new ArgumentError("The raw array is likely empty.");

        const user = await getUser(this.commandContext.client, this.listenerInput[index]);
        if (!user) throw new ArgumentError("Failed to fetch user.");

        return user;
    };
}
