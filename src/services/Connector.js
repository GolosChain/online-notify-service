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
