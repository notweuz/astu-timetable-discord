const BaseCommand = require('../../struct/BaseCommand.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { request } = require('undici')

class Stats extends BaseCommand {
    constructor() {
        super('расписание', {
            data: new SlashCommandBuilder()
                .setName('расписание')
                .setDescription('Указывает расписание выбранной группы.')
                .addStringOption(option => option.setName('группа')
                    .setDescription('Код группы, пример: ДКМО_13/1.')
                    .setMaxLength(30)
                    .setRequired(true))
                .addStringOption(option => option.setName('неделя')
                    .setDescription('Первая/Вторая неделя')
                    .addChoices(
                        { name: 'Первая', value: "1" },
                        { name: 'Вторая', value: "2" }
                    )
                    .setRequired(true))
        });
    }

    async run(client, interaction) {
        const group = interaction.options.getString('группа');
        const week = Number(interaction.options.getString('неделя'));

        let { statusCode, body } = await request(`https://apitable.astu.org/search/get?q=${group}&t=group`)

        if (statusCode === 404 || statusCode === 400) return interaction.reply({
            content: `Не могу найти информацию о данной группе. Возможно ты допустил ошибку.`, ephemeral: true
        });

        let weeks = {
            "1": {},
            "2": {}
        }

        if (statusCode !== 404 && statusCode !== 400) body = await body.json()
        let lessons = body['lessons']

        function getWeekData(day) {
            if (day == 6 || day == 7 || day == 8 || day == 9 || day == 10 || day == 11) {
                return 1
            } else {
                return 0
            }
        }

        /*
        let lessonsDaysSorted = [];
        for (let lesson in lessons) {
            lessonsDaysSorted.push([lesson, lessons[lesson]]);
        }
        lessonsDaysSorted.sort(function(a, b) {
            return a[1]['dayId'] - b[1]['dayId'];
        });
        */

        for (const lesson in lessons) {
            if (getWeekData(lessons[lesson]['dayId']) == 0) {
                weeks["1"][lessons[lesson]['dayId']] += lessons[lesson]['entries'][0]['discipline'].replace('undefined', '')
            } else {
                weeks["2"][lessons[lesson]['dayId']] += lessons[lesson]['entries'][0]['discipline'].replace('undefined', '')
            }
        }

        console.log(weeks)

        //console.log(lessonsDaysSorted)

        /*
        const embed = new MessageEmbed()
            .setTitle('Расписание ')
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
        */
        //interaction.reply();
    }
}

module.exports = Stats;
