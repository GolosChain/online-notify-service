const core = require('gls-core-service');
const BasicController = core.controllers.Basic;
const Model = require('../models/Options');

class History extends BasicController {
    async getHistory({ user, app, fromId, limit, markAsViewed, freshOnly }) {
        const types = await this._getUserRequiredTypes(user, app);
        const params = { user, app, types, fromId, limit, markAsViewed, freshOnly };

        return await this.callService('notify', 'history', params);
    }

    async getHistoryFresh({ user, app }) {
        const types = await this._getUserRequiredTypes(user, app);
        const params = { user, app, types };

        return await this.callService('notify', 'historyFresh', params);
    }

    async _getUserRequiredTypes(user, app) {
        const result = [];
        let options = await Model.findOne({ user, app }, { show: true }, { lean: true });

        if (!options) {
            options = new Model({ user, app });

            await options.save();
        }

        for (let type of Object.keys(options.show)) {
            if (options.show[type]) {
                result.push(type);
            }
        }

        return result;
    }
}

module.exports = History;
