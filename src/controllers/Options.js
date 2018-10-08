const core = require('gls-core-service');
const stats = core.utils.statsClient;
const Logger = core.utils.Logger;
const BasicController = core.controllers.Basic;
const Model = require('../models/Options');

class Options extends BasicController {
    async getOptions({ user }) {
        const time = new Date();
        const model = await this.findOrCreateModel(user);

        stats.timing('get_options', new Date() - time);
        return { show: model.show };
    }

    async setOptions({ user, data }) {
        const time = new Date();

        try {
            const model = await this.findOrCreateModel(user);

            model.show = Object.assign({}, model.show, data.show);

            await model.save();

            stats.timing('set_options', new Date() - time);
        } catch (error) {
            Logger.error(error);
            stats.increment('options_invalid_request');
            throw { code: 400, message: 'Invalid params' };
        }
    }

    async findOrCreateModel(user) {
        let model = await Model.findOne({ user });

        if (!model) {
            model = await new Model({ user });

            await model.save();
        }

        return model;
    }
}

module.exports = Options;
