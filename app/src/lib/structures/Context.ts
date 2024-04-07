import { Err, Ok, Result } from "ts-results-es";
import * as assert from "node:assert";
import {
    type BaseInteraction,
    type ChatInputCommandInteraction,
    type GuildMember,
    type InteractionReplyOptions,
    type Message,
    type MessageReplyOptions,
    type User,
    type Guild,
} from "discord.js";

/*
 * Handles the command run data context. Most of this is taken from https://github.com/sern-handler/handler/tree/main/src/core/structures.
 */

// Safe unwrap
function safeUnwrap<T>(res: Result<T, T>) {
    if (res.isOk()) return res.expect("Tried unwrapping message: " + res);

    return res.expectErr("Tried unwrapping interaction" + res);
}

// Core Context
abstract class CoreContext<M, I> {
    protected constructor(protected ctx: Result<M, I>) {
        assert.ok(typeof ctx === "object" && ctx !== null, "The context is likely not an object, or is null.");
    }

    public get message(): M {
        return this.ctx.expect("Message events cannot be fired when an Interaction event was, and so on.");
    }

    public get interaction(): I {
        return this.ctx.expectErr("Message events cannot be fired when an Interaction event was, and so on.");
    }

    public isMessage(): this is CoreContext<M, never> {
        return this.ctx.isOk();
    }

    public isInteraction(): this is CoreContext<never, I> {
        return !this.isMessage();
    }

    static wrap(_: unknown): unknown {
        throw new Error("You need to override this method; cannot wrap an abstract class");
    }
}

export default class Context extends CoreContext<Message, ChatInputCommandInteraction> {
    protected constructor(protected ctx: Result<Message, ChatInputCommandInteraction>) {
        super(ctx);
    }

    public get options() {
        return this.interaction.options;
    }

    static override wrap(wrappable: BaseInteraction | Message): Context {
        if ("interaction" in wrappable) {
            return new Context(Ok(wrappable));
        }
        assert.ok(wrappable.isChatInputCommand(), "Context created with bad interaction.");
        return new Context(Err(wrappable));
    }

    public get user(): User {
        return safeUnwrap(this.ctx.map((m) => m.author).mapErr((i) => i.user));
    }

    public get author(): User {
        return safeUnwrap(this.ctx.map((m) => m.author).mapErr((i) => i.user));
    }

    public get member(): GuildMember {
        return safeUnwrap(this.ctx.map((m) => m.member).mapErr((i) => i.member)) as GuildMember;
    }

    public get guild(): Guild {
        return safeUnwrap(this.ctx.map((m) => m.guild).mapErr((i) => i.guild)) as Guild;
    }

    public get createdTimestamp(): number {
        return safeUnwrap(this.ctx.map((m) => m.createdTimestamp).mapErr((i) => i.createdTimestamp));
    }

    public get editedTimestamp(): number {
        return safeUnwrap(this.ctx.map((m) => m.editedTimestamp!).mapErr((i) => i.createdTimestamp));
    }

    public async reply(data: any) {
        return safeUnwrap(
            this.ctx
                .map((m) => m.reply(data as MessageReplyOptions))
                .mapErr((i) => i.reply(data as InteractionReplyOptions).then(() => i.fetchReply()))
        );
    }
}
