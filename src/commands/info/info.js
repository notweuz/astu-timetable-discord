const BaseCommand = require('../../struct/BaseCommand.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, version } = require('discord.js');


class Info extends BaseCommand {
    constructor() {
        super('информация', {
            data: new SlashCommandBuilder()
                .setName('информация')
                .setDescription('Информация о боте')
        });
    }

    async run(client, interaction) {

        const embed = new MessageEmbed()
            .setTitle('Информация обо мне.')
            .setDescription(`
Бот был создан для учащихся **АГТУ**. Содержит актуальное расписание.
Помимо этого бот имеет открытый исходный код, так что каждый может посмотреть, как он работает и отправить PR.
            `)
            .addFields(
                {
                    name: 'Мои создатели',
                    value: `
${client.constants.emojis.authors['notweuz']} **${client.users.cache.get('526002410607476740').tag}**
${client.constants.emojis.authors['nelifs']} **${client.users.cache.get('407865383157235722').tag}**`,
                    inline: true
                },
                {
                    name: 'Информация',
                    value: `
Основан: **discord.js** **${version}**
Сайт Расписания: **[Ссылка](https://table.astu.org/)**`,
                    inline: true
                },
                {
                    name: 'Ссылки', value: `
[Github notweuz](https://github.com/notweuz)
[Github Феня♡](https://github.com/nelifs)
[Хостинг](https://cloud.yandex.com/en-ru/)
[Исходный код](https://github.com/notweuz/astu-timetable-discord)
                `, inline: true
                }
            )
            .setThumbnail(client.user.avatarURL({ dynamic: true, size: 2048 }))
            .setColor(client.color);

        interaction.reply({ embeds: [embed] });
    }
}

module.exports = Info;
