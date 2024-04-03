export class ArgumentFailed extends Error {
    public name: string = "ArgumentFailed";
    public reason: string;
    public message: string;

    public constructor(reason: string) {
        super(`A \`${reason}\` argument is required for this command.`);

        this.reason = reason;
        this.message = `A \`${reason}\` argument is required for this command.`;
    }
}

export class GenericFailure extends Error {
    public name: string = "GenericFailure";
    public message: string;

    public constructor(message: string) {
        super(message);

        this.message = message;
    }
}

export class PublicFailure extends Error {
    public name: string = "PublicFailure";
    public message: string;

    public constructor(message: string) {
        super(message);

        this.message = message;
    }
}

export class CommandRunFailure extends Error {
    public name: string = "CommandRunFailure";
    public reason: string;
    public message: string;

    public constructor(reason: string) {
        super(`Failed to run a command due to "${reason}"`);

        this.reason = reason;
        this.message = `Failed to run a command due to "${reason}"`;
    }
}
