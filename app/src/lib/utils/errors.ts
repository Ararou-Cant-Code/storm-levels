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
