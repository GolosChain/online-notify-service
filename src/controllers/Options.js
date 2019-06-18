const core = require('gls-core-service');
const Logger = core.utils.Logger;
const BasicController = core.controllers.Basic;
const Model = require('../models/Options');

class Options extends BasicController {
    async getOptions({ user }) {
        const model = await this.findOrCreateModel(user);

        return { show: model.show };
    }

    async setOptions({ user, data }) {
        try {
            const model = await this.findOrCreateModel(user);

            model.show = Object.assign({}, model.show, data.show);

            await model.save();
        } catch (error) {
            Logger.error(error);
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
