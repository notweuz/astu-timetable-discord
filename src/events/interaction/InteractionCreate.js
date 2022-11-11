const BaseEvent = require('../../struct/BaseEvent.js');

class InteractionCreate extends BaseEvent {
    constructor() {
        super('InteractionCreate', { event: 'interactionCreate' });
    }

    async run(client, interaction) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            command.run(client, interaction);
            client.handledCommands++;
        }
    }
}

module.exports = InteractionCreate;
