const core = require('gls-core-service');
const Logger = core.utils.Logger;
const BasicController = core.controllers.Basic;
const Model = require('../models/Options');

class Options extends BasicController {
    async getOptions({ user, app }) {
        const model = await this.findOrCreateModel(user, app);

        return { show: model.show };
    }

    async setOptions({ user, app, data }) {
        try {
            const model = await this.findOrCreateModel(user, app);

            model.show = Object.assign({}, model.show, data.show);

            await model.save();
        } catch (error) {
            Logger.error(error);
            throw { code: 400, message: 'Invalid params' };
        }
    }

    async findOrCreateModel(user, app) {
        let model = await Model.findOne({ user, app });

        if (!model) {
            model = await new Model({ user, app });

            await model.save();
        }

        return model;
    }
}

module.exports = Options;
