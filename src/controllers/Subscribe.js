const core = require('gls-core-service');
const BasicController = core.controllers.Basic;

class Subscribe extends BasicController {
    async subscribe({ user, app, channelId }) {
        this.connector.addToUserRouting(user, app, channelId);
    }

    async unsubscribe({ user, app, channelId }) {
        this.connector.removeFromUserRouting(user, app, channelId);
    }

    async unsubscribeByChannelId({ channelId }) {
        this.connector.removeFromUserRoutingByChannelId(channelId);
    }
}

module.exports = Subscribe;
