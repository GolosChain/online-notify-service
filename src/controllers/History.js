const core = require('gls-core-service');
const BasicController = core.controllers.Basic;
const Model = require('../models/Options');

class History extends BasicController {
    async getHistory({ user, fromId = null, limit = 10, markAsViewed = true }) {
        const types = await this._getUserRequiredTypes(user);
        const params = { user, types, fromId, limit, markAsViewed };

        return await this.sendTo('notify', 'getHistory', params);
    }

    async getHistoryFresh({ user }) {
        const types = await this._getUserRequiredTypes(user);
        const params = { user, types };

        return await this.sendTo('notify', 'getHistoryFresh', params);
    }

    async _getUserRequiredTypes(user) {
        const result = [];
        const options = await Model.findOne({ user }, { show: true }, { lean: true });

        if (!options || !options.show) {
            throw { code: 404, message: 'Not found' };
        }

        for (let key of Object.keys(options)) {
            if (options[key]) {
                result.push(key);
            }
        }

        return result;
    }
}

module.exports = History;
