const core = require('gls-core-service');
const Logger = core.utils.Logger;
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

        this._clientIdRoutingMapping = new Map(); // clientId -> channelId
        this._channelIdRoutingMapping = new Map(); // channelId -> clientId
        this._history = new History({ connector });
        this._options = new Options({ connector });
        this._subscribe = new Subscribe({ connector });
        this._transfer = new Transfer({ connector, optionsController: this._options });
    }

    async start() {
        await super.start({
            serverRoutes: {
                transfer: {
                    handler: this._transfer.handle,
                    scope: this._transfer,
                },
                subscribe: {
                    handler: this._subscribe.subscribe,
                    scope: this._subscribe,
                    inherits: ['identification', 'channelSpecify'],
                    validation: {},
                },
                unsubscribe: {
                    handler: this._subscribe.unsubscribe,
                    scope: this._subscribe,
                    inherits: ['identification', 'channelSpecify'],
                    validation: {},
                },
                unsubscribeByChannel: {
                    handler: this._subscribe.unsubscribeByChannelId,
                    scope: this._subscribe,
                    inherits: ['channelSpecify'],
                    validation: {},
                },
                getOptions: {
                    handler: this._options.getOptions,
                    scope: this._options,
                    inherits: ['identification'],
                    validation: {},
                },
                setOptions: {
                    handler: this._options.setOptions,
                    scope: this._options,
                    inherits: ['identification'],
                    validation: {
                        required: ['data'],
                        properties: {
                            data: {
                                type: 'object',
                                additionalProperties: false,
                                validation: {
                                    properties: {
                                        show: {
                                            type: 'object',
                                            additionalProperties: false,
                                            validation: {
                                                properties: {
                                                    upvote: {
                                                        type: 'boolean',
                                                        default: true,
                                                    },
                                                    downvote: {
                                                        type: 'boolean',
                                                        default: true,
                                                    },
                                                    transfer: {
                                                        type: 'boolean',
                                                        default: true,
                                                    },
                                                    reply: {
                                                        type: 'boolean',
                                                        default: true,
                                                    },
                                                    subscribe: {
                                                        type: 'boolean',
                                                        default: true,
                                                    },
                                                    unsubscribe: {
                                                        type: 'boolean',
                                                        default: true,
                                                    },
                                                    mention: {
                                                        type: 'boolean',
                                                        default: true,
                                                    },
                                                    repost: {
                                                        type: 'boolean',
                                                        default: true,
                                                    },
                                                    reward: {
                                                        type: 'boolean',
                                                        default: true,
                                                    },
                                                    curatorReward: {
                                                        type: 'boolean',
                                                        default: true,
                                                    },
                                                    witnessVote: {
                                                        type: 'boolean',
                                                        default: true,
                                                    },
                                                    witnessCancelVote: {
                                                        type: 'boolean',
                                                        default: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                history: {
                    handler: this._history.getHistory,
                    scope: this._history,
                    inherits: ['identification'],
                    validation: {
                        properties: {
                            fromId: {
                                type: ['string', 'null'],
                                default: null,
                            },
                            limit: {
                                type: 'number',
                                default: 10,
                            },
                            markAsViewed: {
                                type: 'boolean',
                                default: true,
                            },
                            freshOnly: {
                                type: 'boolean',
                                default: false,
                            },
                        },
                    },
                },
                historyFresh: {
                    handler: this._history.getHistoryFresh,
                    scope: this._history,
                    inherits: ['identification'],
                    validation: {},
                },
            },
            serverDefaults: {
                parents: {
                    identification: {
                        validation: {
                            required: ['app', 'user'],
                            properties: {
                                app: {
                                    type: 'string',
                                    enum: ['cyber', 'gls'],
                                    default: 'cyber',
                                },
                                user: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                    channelSpecify: {
                        validation: {
                            required: ['channelId'],
                            properties: {
                                channelId: {
                                    type: ['string', 'number'],
                                },
                            },
                        },
                    },
                },
            },
            requiredClients: {
                facade: env.GLS_FACADE_CONNECT,
                notify: env.GLS_NOTIFY_CONNECT,
            },
        });
    }

    addToUserRouting(user, app, channelId) {
        const clientId = this._makeUserClientId(user, app);
        const routes = this._clientIdRoutingMapping.get(clientId) || new Set();

        routes.add(channelId);

        this._channelIdRoutingMapping.set(channelId, clientId);

        // force add routes Set if new
        this._clientIdRoutingMapping.set(clientId, routes);
    }

    removeFromUserRouting(user, app, channelId) {
        const clientId = this._makeUserClientId(user, app);
        const routes = this._clientIdRoutingMapping.get(clientId);

        if (!routes) {
            return;
        }

        this._removeUserRouting(clientId, channelId, routes);
    }

    removeFromUserRoutingByChannelId(channelId) {
        const clientId = this._channelIdRoutingMapping.get(channelId);

        if (!clientId) {
            return;
        }

        const routes = this._clientIdRoutingMapping.get(clientId);

        if (!routes) {
            Logger.warn('Unknown user routes for: ', clientId);
            this._channelIdRoutingMapping.delete(channelId);
            return;
        }

        this._removeUserRouting(clientId, channelId, routes);
    }

    _removeUserRouting(clientId, channelId, routes) {
        routes.delete(channelId);
        this._channelIdRoutingMapping.delete(channelId);

        if (!routes.size) {
            this._clientIdRoutingMapping.delete(clientId);
        }
    }

    getUserRouting(user, app) {
        const clientId = this._makeUserClientId(user, app);

        return this._clientIdRoutingMapping.get(clientId);
    }

    hasUserRouting(user, app) {
        const clientId = this._makeUserClientId(user, app);

        return this._clientIdRoutingMapping.has(clientId);
    }

    _makeUserClientId(user, app) {
        return user + app;
    }
}

module.exports = Connector;
