const core = require('gls-core-service');
const BasicController = core.controllers.Basic;

class Subscribe extends BasicController {
    async subscribe({ user, channelId, requestId }) {
        let routes = this.connector.routingMapping.get(user);

        if (!routes) {
            routes = new Map();

            this.connector.routingMapping.set(user, routes);
        }

        routes.set(channelId, requestId);
    }

    async unsubscribe({ user, channelId }) {
        this.connector.removeFromRoutingMapping(user, channelId);
    }
}

module.exports = Subscribe;
