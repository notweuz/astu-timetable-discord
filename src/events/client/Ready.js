const BaseEvent = require('../../struct/BaseEvent');
const { request } = require('undici');


class Ready extends BaseEvent {
    constructor() {
        super('Ready', { event: 'ready' });
    }

    async run(client) {

        const lessonTimes = {
            '1': { 'start': 8 * 60 + 30, 'end': 10 * 60 },
            '2': { 'start': 10 * 60 + 15, 'end': 11 * 60 + 45 },
            '3': { 'start': 12 * 60, 'end': 13 * 60 + 30 },
            '4': { 'start': 14 * 60, 'end': 15 * 60 + 30 },
            '5': { 'start': 15 * 60 + 45, 'end': 17 * 60 + 15 },
            '6': { 'start': 17 * 60 + 30, 'end': 19 * 60 },
            '7': { 'start': 19 * 60 + 15, 'end': 20 * 60 + 45 }
        }

        const date = new Date(new Date().toLocaleString('ru', { timeZone: 'Europe/Astrakhan' }));

        let timeRightNow = date.getHours() * 60 + date.getMinutes();

        const { body } = await request(`https://apitable.astu.org/meta/weekOverride`);

        let para = '';

        let list = [(body !== 1 ? 'Первая' : 'Вторая') + ' неделя', para + '-ая пара'];

        let index = 0;

        client.user.setActivity(`${list[index]}`, { type: 'WATCHING' });
        setInterval(() => {
            for (let i = 1; i <= 7; i++) {
                if (timeRightNow >= lessonTimes[i]?.start && timeRightNow <= lessonTimes[i]?.end) {
                    para = i.toString();
                    list[1] = para + '-ая пара';
                    break;
                } else {
                    list[1] = 'Нет пары';
                }
            }
            if (list.length - 1 <= index) {
                index = -1;
            }
            index++;
            client.user.setActivity(`${list[index]}`, { type: 'WATCHING' });
        }, 15000);

        console.log(client.user.tag + ' ready!');
        //await client.guilds.cache.get('895713087565484073').commands.set(client.commandsArray);
        await client.application.commands.set(client.commandsArray);
    }
}

module.exports = Ready;
