const fs = require('fs');

module.exports = async function LoadEvents(client) {
    for (let folder of fs.readdirSync('./src/events')) {
        for (let file of fs.readdirSync(`./src/events/${folder}`).filter(x => x.endsWith('.js'))) {
            const Event = require(`../events/${folder}/${file}`);
            const event = new Event();
            client.events.set(event.name, event);
            client.on(event.event, event.run.bind(event, client));
        }
    }
};
