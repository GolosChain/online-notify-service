const core = require('gls-core-service');
const stats = core.utils.statsClient;
const Logger = core.utils.Logger;
const BasicController = core.controllers.Basic;

class Transfer extends BasicController {
    constructor(options) {
        super(options);

        this._optionsController = options.optionsController;
    }

    async handle(data) {
        const time = new Date();

        await this._filtrateTransferByOptions(data);

        if (Object.keys(data).length === 0) {
            return;
        }

        for (let user of Object.keys(data)) {
            await this._transferTo(user, data[user]);
        }

        stats.timing('transfer_events', new Date() - time);
    }

    async _filtrateTransferByOptions(data) {
        for (let user of Object.keys(data)) {
            const result = [];

            if (!this.connector.routingMapping.has(user)) {
                continue;
            }

            const subscribe = await this._optionsController.findOrCreateModel(user);

            for (let event of data[user]) {
                if (subscribe.show[event.eventType]) {
                    result.push(event);
                }
            }

            if (result.length) {
                data[user] = result;
            } else {
                delete data[user];
            }
        }
    }

    async _transferTo(user, data) {
        const channels = this.connector.routingMapping.get(user);

        if (!channels) {
            // async race
            return;
        }

        for (let [channelId] of channels) {
            try {
                await this.sendTo('facade', 'transfer', {
                    channelId,
                    method: 'onlineNotify',
                    user,
                    result: data,
                });
            } catch (error) {
                this.connector.removeFromRoutingMapping(user, channelId);

                if (error.code !== 404) {
                    Logger.error(`Fail to send notification - ${error.message}`);
                }
            }
        }
    }
}

module.exports = Transfer;
