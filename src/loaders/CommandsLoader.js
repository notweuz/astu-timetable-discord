const fs = require('fs');

module.exports = async function LoadCommands(client) {
    for (let folder of fs.readdirSync('./src/commands')) {
        for (let file of fs.readdirSync(`./src/commands/${folder}`).filter(x => x.endsWith('.js'))) {
            const Command = require(`../commands/${folder}/${file}`);
            const cmd = new Command();
            client.commandsArray.push(cmd.data.toJSON());
            await client.commands.set(cmd.data.toJSON().name, cmd);
        }
    }
};
