class BaseCommand {
    constructor(name, options = {}) {
        this.name = name;
        this.data = options.data;
    }
}

module.exports = BaseCommand;