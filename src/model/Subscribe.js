const core = require('gls-core-service');
const MongoDB = core.service.MongoDB;

module.exports = MongoDB.makeModel(
    'Subscribe',
    {
        user: {
            type: String,
            required: true,
        },
        show: {
            vote: {
                type: Boolean,
                default: true,
            },
            flag: {
                type: Boolean,
                default: true,
            },
            transfer: {
                type: Boolean,
                default: true,
            },
            reply: {
                type: Boolean,
                default: true,
            },
            subscribe: {
                type: Boolean,
                default: true,
            },
            unsubscribe: {
                type: Boolean,
                default: true,
            },
            mention: {
                type: Boolean,
                default: true,
            },
            repost: {
                type: Boolean,
                default: true,
            },
            award: {
                type: Boolean,
                default: true,
            },
            curatorAward: {
                type: Boolean,
                default: true,
            },
            message: {
                type: Boolean,
                default: true,
            },
            witnessVote: {
                type: Boolean,
                default: true,
            },
            witnessCancelVote: {
                type: Boolean,
                default: true,
            },
        },
    },
    {
        index: [
            {
                fields: {
                    user: 1,
                },
                options: {
                    unique: true,
                },
            },
        ],
    }
);
