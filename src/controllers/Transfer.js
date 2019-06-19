const core = require('gls-core-service');
const Logger = core.utils.Logger;
const BasicController = core.controllers.Basic;

class Transfer extends BasicController {
    constructor(options) {
        super(options);

        this._optionsController = options.optionsController;
    }

    async handle(messageObject) {
        for (const app of Object.keys(messageObject)) {
            const data = messageObject[app];

            await this._filtrateTransferByOptions(app, data);

            if (Object.keys(data).length === 0) {
                return;
            }

            for (const user of Object.keys(data)) {
                await this._transferTo(user, app, data[user]);
            }
        }
    }

    async _filtrateTransferByOptions(app, data) {
        const forDelete = [];

        for (const user of Object.keys(data)) {
            const result = [];

            if (!this.connector.hasUserRouting(user, app)) {
                continue;
            }

            const subscribe = await this._optionsController.findOrCreateModel(user, app);

            for (const event of data[user]) {
                if (subscribe.show[event.eventType]) {
                    result.push(event);
                }
            }

            if (result.length) {
                data[user] = result;
            } else {
                forDelete.push(user);
            }
        }

        for (const user of forDelete) {
            delete data[user];
        }
    }

    async _transferTo(user, app, userData) {
        const channels = this.connector.getUserRouting(user, app);

        if (!channels) {
            return;
        }

        for (const channelId of channels) {
            try {
                await this.sendTo('facade', 'transfer', {
                    channelId,
                    method: 'onlineNotify',
                    user,
                    result: userData,
                });
            } catch (error) {
                this.connector.removeFromUserRouting(user, app, channelId);

                if (error.code !== 404) {
                    Logger.error('Fail to send notification', error);
                }
            }
        }
    }
}

module.exports = Transfer;
