const core = require('gls-core-service');
const stats = core.Stats.client;
const logger = core.Logger;
const errors = core.HttpError;
const BasicService = core.service.Basic;
const Gate = core.service.Gate;
const env = require('../Env');
const Subscribe = require('../model/Subscribe');

class Notify extends BasicService {
    constructor() {
        super();

        this._gate = new Gate();
        this._routingMapping = new Map(); // user -> channelId -> requestId
    }

    async start() {
        await this._gate.start({
            serverRoutes: {
                subscribe: this._subscribe.bind(this),
                unsubscribe: this._unsubscribe.bind(this),
                getOptions: this._getOptions.bind(this),
                setOptions: this._setOptions.bind(this),
                transfer: this._transfer.bind(this),
            },
            requiredClients: {
                facade: env.GLS_FACADE_CONNECT,
            },
        });

        this.addNested(this._gate);
    }

    async stop() {
        await this.stopNested();
    }

    async _subscribe({ user, channelId, requestId }) {
        let routes = this._routingMapping.get(user);

        if (!routes) {
            routes = new Map();

            this._routingMapping.set(user, routes);
        }

        routes.set(channelId, requestId);

        return 'Ok';
    }

    async _unsubscribe({ user, channelId }) {
        this._removeFromRoutingMapping(user, channelId);

        return 'Ok';
    }

    async _getOptions({ user }) {
        const time = new Date();
        const data = await Subscribe.findOne({ user }, { show: true }, { lean: true });

        if (!data) {
            throw errors.E400.error;
        }

        stats.timing('get_options', new Date() - time);
        return data.show;
    }

    async _setOptions({ user, data }) {
        const time = new Data();

        await Option.updateOne(
            {
                user,
            },
            {
                $set: {
                    user,
                    $set: {
                        show: data,
                    },
                },
            },
            {
                upsert: true,
                runValidators: true,
            }
        );

        stats.timing('set_options', new Date() - time);
        return 'Ok';
    }

    async _transfer(data) {
        const time = new Date();

        await this._filtrateTransferByOptions(data);

        if (Object.keys(data).length === 0) {
            return;
        }

        for (let user of Object.keys(data)) {
            await this._transferTo(user, data[user]);
        }

        stats.timing('transfer_events', new Date() - time);
        return 'Ok';
    }

    async _filtrateTransferByOptions(data) {
        for (let user of Object.keys(data)) {
            if (!this._routingMapping.has(user)) {
                continue;
            }

            const subscribe = await Subscribe.find({ user }, {}, { lean: true });

            if (!subscribe) {
                delete data[user];
                continue;
            }

            for (let event of Object.keys(data[user])) {
                if (!subscribe.show[event]) {
                    delete data[user][event];
                }
            }

            if (Object.keys(data[user]).length === 0) {
                delete data[user];
            }
        }
    }

    _removeFromRoutingMapping(user, channelId) {
        const routing = this._routingMapping.get(user);

        if (!routing) {
            return;
        }

        routing.delete(channelId);

        if (!routing.size()) {
            this._routingMapping.delete(user);
        }
    }

    async _transferTo(user, data) {
        const channels = this._routingMapping.get(user);

        if (!channels) {
            // async race
            return;
        }

        for (let [channelId, requestId] of channels) {
            try {
                await this._gate.sendTo('facade', 'transfer', {
                    channelId,
                    requestId,
                    user,
                    result: data,
                });
            } catch (error) {
                this._removeFromRoutingMapping(user, channelId);

                if (error.code !== 404) {
                    logger.error(`Fail to send notification - ${error.message}`);
                }
            }
        }
    }
}

module.exports = Notify;
