const { Client, Collection, Intents } = require('discord.js'),
    LoadCommands = require('../loaders/CommandsLoader.js'),
    LoadEvents = require('../loaders/EventsLoader.js');
require('dotenv').config();

module.exports = class extends Client {
    constructor() {
        super({
            intents: [Intents.FLAGS.GUILDS]
        });
        this.commandsArray = [];
        this.commands = new Collection();
        this.events = new Collection();
        this.handledCommands = 0;
        this.color = '#5865f2';
        this.constants = require('../misc/constants.json');
        this.token = process.env.TOKEN;
    }


    start() {
        process.on('uncaughtException', console.error);
        LoadEvents(this).catch(console.error);
        console.log('Loaded ' + this.events.size + ' events!');
        LoadCommands(this).catch(console.error);
        console.log('Loaded ' + this.commands.size + ' commands!');
        super.login().catch(console.error);
    }
};
