class BaseEvent {
    constructor(name, options = {}) {
        this.name = name;
        this.event = options.event || null;
    }
}

module.exports = BaseEvent;