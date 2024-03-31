import { APIEmbedField, EmbedBuilder, Message } from "discord.js";
import { Client } from "../../lib/structures/Client.js";
import Command from "../../lib/structures/Command.js";

export default abstract class HelpCommand extends Command {
    public constructor(client: Client) {
        super(client, {
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
        const commands = this.client.commands.map((c) => c);

        for (var c = 0; c < commands.length; c++) {
            if (categories.includes(commands[c].directory!)) continue;

            categories.push(commands[c].directory!);
        }

        categories.map((category) =>
            embedFields.push({
                name: category,
                value: commands
                    .filter((cmd) => cmd.directory === category)
                    .map((cmd) => `\`${cmd.name}\``)
                    .join(", "),
                inline: false,
            })
        );

        const command =
            this.client.commands.get(args[0]) || this.client.commands.get(this.client.aliases.get(args[0])!);
        if (!command)
            return message.reply({
                embeds: [
                    {
                        author: {
                            name: `${this.client.user!.username} (${this.client.user!.id})`,
                            icon_url: this.client.user!.displayAvatarURL(),
                        },
                        title: "📝 Commands",
                        description: `Viewing **${commands.length}** commands.`,
                        fields: embedFields,
                    },
                ],
            });

        cmdDetails.setAuthor({
            name: this.client.user!.username,
            iconURL: this.client.user!.displayAvatarURL(),
        });
        cmdDetails.setTitle(
            `📝 ${this.client.defaultPrefix}${command.name}${
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
