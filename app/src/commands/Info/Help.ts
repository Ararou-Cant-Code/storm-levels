import { APIEmbedField, EmbedBuilder, Message } from "discord.js";
import Command, { CommandContext } from "../../lib/structures/Command.js";

export default abstract class HelpCommand extends Command {
    public constructor(context: CommandContext) {
        super(context, {
            name: "Help",
            description: "View commands on the bot.",
            detailedDescription: {
                usage: "(Views all commands) | <commandName: string> (Views information on a command)",
            },
        });
    }

    public override run = async (message: Message, args: string[]) => {
        const cmdDetails = new EmbedBuilder();
        const embedFields: APIEmbedField[] = [];
        const categories: string[] = [];
        const commands = this.context.client.commands.map((c) => c);

        for (var c = 0; c < commands.length; c++) {
            if (categories.includes(commands[c].context.directory!)) continue;

            categories.push(commands[c].context.directory!);
        }

        categories.map((category) =>
            embedFields.push({
                name: category,
                value: commands
                    .filter((cmd) => cmd.context.directory === category)
                    .map((cmd) => `\`${cmd.name}\``)
                    .join(", "),
                inline: false,
            })
        );

        const command =
            this.context.client.commands.get(args[0]) ||
            this.context.client.commands.get(this.context.client.aliases.get(args[0])!);
        if (!command)
            return message.reply({
                embeds: [
                    {
                        color: 0xd1daf9,
                        author: {
                            name: `${this.context.client.user!.username} (${this.context.client.user!.id})`,
                            icon_url: this.context.client.user!.displayAvatarURL(),
                        },
                        title: "📝 Commands",
                        description: `Viewing **${commands.length}** commands.`,
                        fields: embedFields,
                    },
                ],
            });

        cmdDetails.setColor(0xd1daf9).setAuthor({
            name: this.context.client.user!.username,
            iconURL: this.context.client.user!.displayAvatarURL(),
        });
        cmdDetails.setTitle(
            `📝 ${this.context.client.defaultPrefix}${command.name}${
                command.options.detailedDescription?.usage ? ` ${command.options.detailedDescription.usage}` : ""
            }`
        );
        if (
            command.options.description ||
            command.options.aliases ||
            command.options.detailedDescription ||
            command.options.permissions
        )
            cmdDetails.setDescription(
                `${command.options.description ? `**Description:** ${command.options.description}` : ""}${
                    command.options.aliases ? `\n**Aliases:** ${command.options.aliases.join(", ")}` : ""
                }${
                    command.options.detailedDescription && command.options.detailedDescription.examples
                        ? `**Example(s)** ${command.options.detailedDescription.examples.join("\n")}`
                        : ""
                }`
            );

        return message.reply({ embeds: [cmdDetails] });
    };
}
