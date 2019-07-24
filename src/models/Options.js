const core = require('gls-core-service');
const MongoDB = core.services.MongoDB;

module.exports = MongoDB.makeModel(
    'Options',
    {
        user: {
            type: String,
            required: true,
        },
        app: {
            type: String,
            enum: ['gls', 'cyber'],
            required: true,
        },
        show: {
            upvote: {
                type: Boolean,
                default: true,
            },
            downvote: {
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
            reward: {
                type: Boolean,
                default: true,
            },
            curatorReward: {
                type: Boolean,
                default: true,
            },
            benefeciaryReward: {
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
                    app: 1,
                },
                options: {
                    unique: true,
                },
            },
        ],
    }
);
