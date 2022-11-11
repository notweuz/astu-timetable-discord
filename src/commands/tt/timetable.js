const BaseCommand = require('../../struct/BaseCommand.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
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

            const weekObj = weeks[weekFor?.toString()][day?.toString()][(i-1).toString()] ?? '';
            const daysNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            const types = { 'practice': 'Практика', 'lecture': 'Лекция' };

            if (i === 0) {
                list += `\n**${daysNames[day]}**\n\n`;
                console.log('DAY ' + i);
            } else {
                list += `${weekObj.name ? `**${i}.**` : ''} ${weekObj.name ? weekObj.name : ''} ${types[weekObj.type] ? '(' + types[weekObj.type] + ') — ' : ''}${weekObj.teacher ? weekObj.teacher + ' — ' : ''}${weekObj.place ? weekObj.place : ''}${weekObj.name ? '\n' : ''}`;
                console.log('LESSON ' + i);
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

        const embed = new MessageEmbed()
            .setTitle(`Расписание группы ${group}`)
            .setColor(client.color)
            .setDescription(list.toString());

        interaction.reply({ embeds: [embed] });
        //interaction.reply();
    }
}

module.exports = Stats;
