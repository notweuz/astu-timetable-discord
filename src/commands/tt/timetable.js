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
                    .setRequired(true))/*
                .addStringOption(option => option.setName('неделя')
                    .setDescription('Первая/Вторая неделя')
                    .addChoices(
                        { name: 'Первая', value: '1' },
                        { name: 'Вторая', value: '2' }
                    )
                    .setRequired(true))*/
        });
    }

    async run(client, interaction) {
        const group = interaction.options.getString('группа');
        const week = Number(interaction.options.getString('неделя'));

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

        let list = '';
        let day = 0;
        let weekFor = 1;

        for (let i = 0; i < 7; i++) {

            const lesson = weeks[weekFor?.toString()][day?.toString()][(i-1).toString()] ?? '';
            const daysNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            const types = { 'practice': 'Практика', 'lecture': 'Лекция' };

            if (i === 0) {
                list += `\n> **${daysNames[day]}**\n\n`;
            } else {
                list += `${lesson.name ? `**${i}.**` : ''} ${lesson.name ? lesson.name : ''} ${types[lesson.type] ? '(' + types[lesson.type] + ') — ' : ''}${lesson.teacher ? lesson.teacher + ' — ' : ''}${lesson.place ? lesson.place : ''}${lesson.name ? '\n' : ''}`;
            }

            if (i >= 5) {
                day++;
                i = -1;
            }
            if (day >= 6) {
                weekFor++;
            }

            if (weekFor >= 2) break;
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

        const embed = new MessageEmbed()
            .setTitle(`Расписание группы ${group} - ${week} неделя`)
            .setColor(client.color)
            .setDescription(list.toString());

        await interaction.reply({ embeds: [embed], components: [row] });

        const message = await interaction.fetchReply()

        const filter = i => i.user.id === interaction.user.id && i.message.id === message.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 1000 * 60 });

        collector.on('collect', async i => {
            let newValue = i.values[0];
            list = '';
            day = 0;
            weekFor = Number(newValue);
            for (let i = 0; i < 7; i++) {

                const lesson = weeks[weekFor?.toString()][day?.toString()][(i-1).toString()] ?? '';
                const daysNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
                const types = { 'practice': 'Практика', 'lecture': 'Лекция' };

                if (i === 0) {
                    list += `\n> **${daysNames[day]}**\n\n`;
                } else {
                    list += `${lesson.name ? `**${i}.**` : ''} ${lesson.name ? lesson.name : ''} ${types[lesson.type] ? '(' + types[lesson.type] + ') — ' : ''}${lesson.teacher ? lesson.teacher + ' — ' : ''}${lesson.place ? lesson.place : ''}${lesson.name ? '\n' : ''}`;
                }

                if (i >= 5) {
                    day++;
                    i = -1;
                }
                if (day >= 6) {
                    weekFor++;
                }

                if (weekFor >= 2) break;
            }
            await i.update({
                embeds: [embed.setDescription(list.toString()).setTitle(`Расписание группы ${group} - ${newValue} неделя`)],
            })
        })
        //interaction.reply();
    }
}

module.exports = Stats;
