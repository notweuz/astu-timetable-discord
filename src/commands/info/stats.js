const BaseCommand = require('../../struct/BaseCommand.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const os = require('os')

class Stats extends BaseCommand {
    constructor() {
        super('статистика', {
            data: new SlashCommandBuilder()
                .setName('статистика')
                .setDescription('Статистика бота, работоспособность сервера и прочая (ненужная) информация')
        });
    }

    async run(client, interaction) {
        const embed = new MessageEmbed()
            .addFields(
                { name: 'Статистика бота', value: `
Серверов: **${client.guilds.cache.size}**
Пользователей: **${client.guilds.cache.map(g => g).reduce((a, b) => a + b.memberCount, 0)}**
Каналов: **${client.channels.cache.size}**
Обработано команд: **${client.handledCommands}**
            `, inline: true},
                { name: 'Работоспособность сервера', value: `
Запущен **<t:${~~(client.readyAt / 1000)}:R>**
Задержка вебсокета: **${client.ws.ping}ms**
Использование ОЗУ: **${~~(process.memoryUsage().rss / 1024 ** 2)}Мб**
                `, inline: true},
                { name : 'Информация о сервере', value: `
Процессор: **${os.cpus()[0]['model']}**
ОС: **${os.type()}**
Объём ОЗУ: **${~~(os.totalmem() / 1024 / 1024 / 1024) + 1}Гб**
                `})
            .setThumbnail(client.user.avatarURL({dynamic: true, size: 2048}))
            .setColor(client.color)

        interaction.reply({embeds: [embed]});
    }
}

module.exports = Stats;
