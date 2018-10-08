const core = require('gls-core-service');
const BasicConnector = core.services.Connector;
const env = require('../data/env');
const History = require('../controllers/History');
const Options = require('../controllers/Options');
const Subscribe = require('../controllers/Subscribe');
const Transfer = require('../controllers/Transfer');

class Connector extends BasicConnector {
    constructor() {
        super();

        const connector = this;

        this.routingMapping = new Map(); // user -> channelId -> requestId
        this._history = new History({ connector });
        this._options = new Options({ connector });
        this._subscribe = new Subscribe({ connector });
        this._transfer = new Transfer({ connector, optionsController: this._options });
    }

    async start() {
        await super.start({
            serverRoutes: {
                subscribe: this._subscribe.subscribe.bind(this._subscribe),
                unsubscribe: this._subscribe.unsubscribe.bind(this._subscribe),
                getOptions: this._options.getOptions.bind(this._options),
                setOptions: this._options.setOptions.bind(this._options),
                history: this._history.getHistory.bind(this._history),
                historyFresh: this._history.getHistoryFresh.bind(this._history),
                transfer: this._transfer.handle.bind(this._transfer),
            },
            requiredClients: {
                facade: env.GLS_FACADE_CONNECT,
                notify: env.GLS_NOTIFY_CONNECT,
            },
        });
    }

    removeFromRoutingMapping(user, channelId) {
        const routing = this.routingMapping.get(user);

        if (!routing) {
            return;
        }

        routing.delete(channelId);

        if (!routing.size) {
            this.routingMapping.delete(user);
        }
    }
}

module.exports = Connector;
