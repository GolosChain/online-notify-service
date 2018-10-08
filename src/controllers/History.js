const core = require('gls-core-service');
const BasicController = core.controllers.Basic;
const Model = require('../models/Options');

class History extends BasicController {
    async getHistory({ user, fromId = null, limit = 10, markAsViewed = true, freshOnly = false }) {
        const types = await this._getUserRequiredTypes(user);
        const params = { user, types, fromId, limit, markAsViewed, freshOnly };
        const response = await this.sendTo('notify', 'history', params);

        if (response.error) {
            throw response.error;
        } else {
            return response.result;
        }
    }

    async getHistoryFresh({ user }) {
        const types = await this._getUserRequiredTypes(user);
        const params = { user, types };
        const response = await this.sendTo('notify', 'historyFresh', params);

        if (response.error) {
            throw response.error;
        } else {
            return response.result;
        }
    }

    async _getUserRequiredTypes(user) {
        const result = [];
        const options = await Model.findOne({ user }, { show: true }, { lean: true });

        if (!options || !options.show) {
            throw { code: 404, message: 'Not found' };
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
