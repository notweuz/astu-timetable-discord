const BaseCommand = require('../../struct/BaseCommand.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

class Stats extends BaseCommand {
    constructor() {
        super('статистика', {
            data: new SlashCommandBuilder()
                .setName('статистика')
                .setDescription('Статистика бота')
        });
    }

    async run(client, interaction) {
        const embed = new MessageEmbed()
            .setTitle('Статистика')
            .setDescription(`
Сервера: **${client.guilds.cache.size}**
Пользователи: **${client.users.cache.size}**
Каналы: **${client.channels.cache.size}**
Кол-во комманд: **${client.handledCommands++}**

Запущен **<t:${~~(client.readyAt / 1000)}:R>**
Пинг вебсокета: **${client.ws.ping}ms**
ОЗУ: **${~~(process.memoryUsage().heapUsed / 1024 ** 2)}MB :: ${~~(process.memoryUsage().rss / 1024 ** 2)}MB**
            `)
        .setColor(client.color)

        interaction.reply({ embeds: [embed] });
    }
}

module.exports = Stats;
