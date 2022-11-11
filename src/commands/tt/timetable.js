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

        let weeks = {}

        if (statusCode !== 404 && statusCode !== 400) body = await body.json()
        let lessons = body['lessons']

        for (let i = 0; i < lessons.length; i++) {
            let lesson = lessons[i]
            let day = lesson['dayId']

            let name = lesson['entries'][0]['discipline'] ?? 'Отсутствует'
            let type = lesson['entries'][0]['type']
            let lessonOrderId = lesson['lessonOrderId']
            let teacher = lesson['entries'][0]['teacher']
            let place = lesson['entries'][0]['audience']

            if (weeks[week] === undefined) weeks[week] = {}
            if (weeks[week][day] === undefined) weeks[week][day] = {}
            if (weeks[week][day][lessonOrderId] === undefined) weeks[week][day][lessonOrderId] = {name: '', type: '', teacher: '', place: ''}

            weeks[week][day][lessonOrderId] = {
                name: name,
                type: type,
                teacher: teacher,
                place: place
            }
        }

        console.log(weeks)


        const embed = new MessageEmbed()
            .setTitle(`Расписание группы ${group}`)
            .setColor(client.color)
            .setDescription(`
                Понедельник
                1. ${weeks[week.toString()][0][0]?.name ?? 'Отсутствует'} (${weeks[week.toString()][0][0]?.type ?? ''}) - ${weeks[week.toString()][0][0]?.teacher ?? ''} - ${weeks[week.toString()][0][0]?.place ?? ''}
                2. ${weeks[week.toString()][0][1]?.name ?? 'Отсутствует'} (${weeks[week.toString()][0][1]?.type ?? ''}) - ${weeks[week.toString()][0][1]?.teacher ?? ''} - ${weeks[week.toString()][0][1]?.place ?? ''}
                3. ${weeks[week.toString()][0][2]?.name ?? 'Отсутствует'} (${weeks[week.toString()][0][2]?.type ?? ''}) - ${weeks[week.toString()][0][2]?.teacher ?? ''} - ${weeks[week.toString()][0][2]?.place ?? ''}
                4. ${weeks[week.toString()][0][3]?.name ?? 'Отсутствует'} (${weeks[week.toString()][0][3]?.type ?? ''}) - ${weeks[week.toString()][0][3]?.teacher ?? ''} - ${weeks[week.toString()][0][3]?.place ?? ''}
                5. ${weeks[week.toString()][0][4]?.name ?? 'Отсутствует'} (${weeks[week.toString()][0][4]?.type ?? ''}) - ${weeks[week.toString()][0][4]?.teacher ?? ''} - ${weeks[week.toString()][0][4]?.place ?? ''}
                6. ${weeks[week.toString()][0][5]?.name ?? 'Отсутствует'} (${weeks[week.toString()][0][5]?.type ?? ''}) - ${weeks[week.toString()][0][5]?.teacher ?? ''} - ${weeks[week.toString()][0][5]?.place ?? ''}
                7. ${weeks[week.toString()][0][6]?.name ?? 'Отсутствует'} (${weeks[week.toString()][0][6]?.type ?? ''}) - ${weeks[week.toString()][0][6]?.teacher ?? ''} - ${weeks[week.toString()][0][6]?.place ?? ''}
                
                Вторник
                1. ${weeks[week.toString()][1][0]?.name ?? 'Отсутствует'} (${weeks[week.toString()][1][0]?.type ?? ''}) - ${weeks[week.toString()][1][0]?.teacher ?? ''} - ${weeks[week.toString()][1][0]?.place ?? ''}
                2. ${weeks[week.toString()][1][1]?.name ?? 'Отсутствует'} (${weeks[week.toString()][1][1]?.type ?? ''}) - ${weeks[week.toString()][1][1]?.teacher ?? ''} - ${weeks[week.toString()][1][1]?.place ?? ''}
                3. ${weeks[week.toString()][1][2]?.name ?? 'Отсутствует'} (${weeks[week.toString()][1][2]?.type ?? ''}) - ${weeks[week.toString()][1][2]?.teacher ?? ''} - ${weeks[week.toString()][1][2]?.place ?? ''}
                4. ${weeks[week.toString()][1][3]?.name ?? 'Отсутствует'} (${weeks[week.toString()][1][3]?.type ?? ''}) - ${weeks[week.toString()][1][3]?.teacher ?? ''} - ${weeks[week.toString()][1][3]?.place ?? ''}
                5. ${weeks[week.toString()][1][4]?.name ?? 'Отсутствует'} (${weeks[week.toString()][1][4]?.type ?? ''}) - ${weeks[week.toString()][1][4]?.teacher ?? ''} - ${weeks[week.toString()][1][4]?.place ?? ''}
                6. ${weeks[week.toString()][1][5]?.name ?? 'Отсутствует'} (${weeks[week.toString()][1][5]?.type ?? ''}) - ${weeks[week.toString()][1][5]?.teacher ?? ''} - ${weeks[week.toString()][1][5]?.place ?? ''}
                7. ${weeks[week.toString()][1][6]?.name ?? 'Отсутствует'} (${weeks[week.toString()][1][6]?.type ?? ''}) - ${weeks[week.toString()][1][6]?.teacher ?? ''} - ${weeks[week.toString()][1][6]?.place ?? ''}
            `)

        interaction.reply({ embeds: [embed] });
        //interaction.reply();
    }
}

module.exports = Stats;
