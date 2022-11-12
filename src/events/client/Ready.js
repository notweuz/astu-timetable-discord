const BaseEvent = require('../../struct/BaseEvent');
const { request } = require('undici');


class Ready extends BaseEvent {
    constructor() {
        super('Ready', { event: 'ready' });
    }

    async run(client) {

        const date = new Date(new Date().toLocaleString('ru', { timeZone: 'Europe/Astrakhan' }));
        const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

        const { body } = await request(`https://apitable.astu.org/meta/weekOverride`);

        const list = [(body !== 1 ? 'Первая' : 'Вторая') + ' неделя', days[date.getDay()]];

        let index = 0;
        client.user.setActivity(`${list[index]}`, { type: 'WATCHING' });
        setInterval(() => {
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
