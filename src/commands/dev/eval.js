const BaseCommand = require('../../struct/BaseCommand.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const util = require('util')
const { Formatters } = require('discord.js');

class Eval extends BaseCommand {
    constructor() {
        super('eval', {
            data: new SlashCommandBuilder()
                .setName('eval')
                .setDescription('???')
                .addStringOption(option => option.setName('код')
                    .setDescription('???')
                    .setMaxLength(6000)
                    .setRequired(true))
        });
    }

    async run(client, interaction) {
        let code = interaction.options.getString('код');

        if (interaction.user.id !== '526002410607476740' && interaction.user.id !== '407865383157235722') return interaction.reply({ content: 'У тебя нет прав на использование этой команды.', ephemeral: true });

        let executedCode;

        try {
            const before = process.hrtime.bigint();
            executedCode = await eval(code);
            const after = process.hrtime.bigint();
            const time = (parseInt(after - before) / 1000000).toFixed(3);
            if (typeof executedCode !== 'string') {
                executedCode = util.inspect(executedCode);
            }

            if (!code) {
                await interaction.reply('bruh');
            } else {
                const executedFixedCode = executedCode.replace(client.token, 'Фиг тебе, а не токен');

                await interaction.reply({
                    content: `\`${time}ms\`\n**${Formatters.codeBlock('js', executedFixedCode)}**`,
                });
            }
        } catch (error) {
            await interaction.reply(`\`...ms\`\n**${Formatters.codeBlock('js', error)}**`);
            console.error('ERROR [ EVAL ]: \n' + error);
        }
    }
}

module.exports = Eval;
