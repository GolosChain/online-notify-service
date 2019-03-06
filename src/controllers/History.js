const core = require('gls-core-service');
const BasicController = core.controllers.Basic;
const Model = require('../models/Options');

class History extends BasicController {
    async getHistory({ user, fromId = null, limit = 10, markAsViewed = true, freshOnly = false }) {
        const types = await this._getUserRequiredTypes(user);
        const params = { user, types, fromId, limit, markAsViewed, freshOnly };

        return await this.callService('notify', 'history', params);
    }

    async getHistoryFresh({ user }) {
        const types = await this._getUserRequiredTypes(user);
        const params = { user, types };
        return await this.callService('notify', 'historyFresh', params);
    }

    async _getUserRequiredTypes(user) {
        const result = [];
        let options = await Model.findOne({ user }, { show: true }, { lean: true });

        if (!options) {
            options = new Model({ user });

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
