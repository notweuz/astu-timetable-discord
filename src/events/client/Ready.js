const BaseEvent = require('../../struct/BaseEvent');

class Ready extends BaseEvent {
    constructor() {
        super('Ready', { event: 'ready' });
    }

    async run(client) {
        console.log(client.user.tag + ' ready!');
        await client.guilds.cache.get('895713087565484073').commands.set(client.commandsArray);
    }
}

module.exports = Ready;
