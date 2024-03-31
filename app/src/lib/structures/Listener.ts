import { ClientEvents } from "discord.js";
import { Client } from "./Client.js";

export interface ListenerOptions {
    name: string;
    event: keyof ClientEvents;
    once?: boolean;
    run?: (...args: any[]) => unknown;
}

export default abstract class Listener {
    public name: string;

    public once: boolean;

    public options: ListenerOptions;

    public client: Client;

    public abstract run: (...args: any[]) => unknown;

    public constructor(client: Client, options: ListenerOptions) {
        this.client = client;
        this.options = options;
        this.name = options.name;
        this.once = options.once ?? false;
    }
}
