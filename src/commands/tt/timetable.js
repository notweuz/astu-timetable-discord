const BaseCommand = require('../../struct/BaseCommand.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { request } = require('undici');

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
        });
    }

    async run(client, interaction) {
        const group = interaction.options.getString('группа');

        let { statusCode, body } = await request(`https://apitable.astu.org/search/get?q=${group}&t=group`);

        if (statusCode === 404 || statusCode === 400) return interaction.reply({
            content: `Не могу найти информацию о данной группе. Возможно ты допустил ошибку.`, ephemeral: true
        });

        let weeks = {};

        if (statusCode !== 404 && statusCode !== 400) body = await body.json();
        let lessons = body['lessons'];

        for (let i = 0; i < lessons.length; i++) {
            let lesson = lessons[i];
            let day = lesson['dayId'];

            let week = '1';

            if (day >= 6) {
                week = '2';
                day -= 6;
            }

            let name = lesson['entries'][0]['discipline'] ?? 'Отсутствует';
            let type = lesson['entries'][0]['type'];
            let lessonOrderId = lesson['lessonOrderId'];
            let teacher = lesson['entries'][0]['teacher'];
            let place = lesson['entries'][0]['audience'];

            if (weeks[week] === undefined) weeks[week] = {};
            if (weeks[week][day] === undefined) weeks[week][day] = {};
            if (weeks[week][day][lessonOrderId] === undefined) weeks[week][day][lessonOrderId] = {
                name: '',
                type: '',
                teacher: '',
                place: ''
            };

            weeks[week][day][lessonOrderId] = {
                name: name,
                type: type,
                teacher: teacher,
                place: place
            };
        }

        let list = '<:Laboratory:1040728655904636948> — Лабораторная\n<:Practice:1040728659419471935> — Практика\n<:Lecture:1040728657590759424> — Лекция\n';

        function generateList(week) {
            list = '<:Laboratory:1040728655904636948> — Лабораторная\n<:Practice:1040728659419471935> — Практика\n<:Lecture:1040728657590759424> — Лекция\n';
            let day = 0;
            let weekFor = week;
            let noDays = 0;

            const daysInWeek = Object.keys(weeks[weekFor?.toString()]).length;

            for (let i = 0; i < 7; i++) {
                while (weeks[weekFor?.toString()][day?.toString()] === undefined) {
                    day++;
                    noDays++;
                    console.log(day);
                }

                const lesson = weeks[weekFor?.toString()][day?.toString()][(i - 1)?.toString()] ?? '';
                const daysNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
                const types = {
                    'laboratory': '<:Laboratory:1040728655904636948>',
                    'practice': '<:Practice:1040728659419471935>',
                    'lecture': '<:Lecture:1040728657590759424>'
                };

                if (i <= 0) {
                    list += `\n> **${daysNames[day]} (${Object.keys(weeks[weekFor?.toString()][day?.toString()]).length})**\n\n`;
                } else {
                    list += `${lesson.name ? `**${i}.**` : ''} ${types[lesson.type] ? types[lesson.type] : ''} ${lesson.name ? lesson.name + ' — ' : ''} ${lesson.teacher ? lesson.teacher + ' — ' : ''}${lesson.place ? lesson.place : ''}${lesson.name ? '\n' : ''}`;
                }

                if (i >= 6) {
                    day++;
                    i = -1;
                }
                if (day >= 6 || day >= daysInWeek + noDays) {
                    weekFor++;
                }

                if (weekFor >= week + 1) break;
            }
        }

        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('select')
                    .setPlaceholder('Выберите неделю')
                    .addOptions([
                        {
                            label: 'Первая',
                            description: 'Первая неделя',
                            value: '1',
                        },
                        {
                            label: 'Вторая',
                            description: 'Вторая неделя',
                            value: '2',
                        },
                    ]),
            );


        generateList(1);

        const embed = new MessageEmbed()
            .setTitle(`Расписание группы ${group} - 1 неделя`)
            .setColor(client.color)
            .setDescription(list.toString());

        await interaction.reply({ embeds: [embed], components: [row] });

        const message = await interaction.fetchReply();

        const filter = i => i.user.id === interaction.user.id && i.message.id === message.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 1000 * 60 });

        collector.on('collect', async i => {
            const value = i.values[0];
            generateList(Number(value));
            await i.update({
                embeds: [embed.setDescription(list.toString()).setTitle(`Расписание группы ${group} - ${value} неделя`)],
            });
        });
        //interaction.reply();
    }
}

module.exports = Stats;
