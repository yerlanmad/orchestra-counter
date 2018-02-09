var qevents = (function ($) {

    var _cometd = $.cometd;

    var _channels = [];
    var _connected = false;
    var _subscriptions = [];
    var _connectionStatusChangeCallback;

    var COMETD_INITIAL_NETWORK_DELAY = 300000; // 300000ms = 5 minutes
    var COMETD_DEFAULT_MAX_NETWORK_DELAY = 10000; // 10000ms = 10 seconds

    var _connectionStatus = false;

    function _connect(connectionStatusChangeCallback, logLevel) {
        var definedLogLevel = (typeof logLevel !== 'undefined' && logLevel != null) ? logLevel : 'warn';
        var cometURL = location.protocol + "//" + location.host + "/cometd";
        _cometd.configure({
            url: cometURL,
            logLevel: definedLogLevel,
            maxNetworkDelay: COMETD_INITIAL_NETWORK_DELAY
        });

        _cometd.addListener('/meta/handshake', function (handshake) {
            _metaHandshake(handshake, connectionStatusChangeCallback);
        });
        _cometd.addListener('/meta/connect', _metaConnect);
        _cometd.addListener('/meta/disconnect', _metaDisconnect);
        _cometd.addListener('/meta/subscribe', _metaSubscribe);
        _cometd.addListener('/meta/unsubscribe', _metaUnsubscribe);

        _cometd.handshake();
    }

    function _connectionReestablished(status, message) {
        _log('CometD connection established.');

        //_reconnectChannels();
        if (typeof _connectionStatusChangeCallback === "function") {
            _connectionStatusChangeCallback(status);
        }
    }

    function _connectionBroken(status, message) {
        _log('CometD connection broken :(');
        if (typeof _connectionStatusChangeCallback === "function") {
            _connectionStatusChangeCallback(status, message.error);
        }
    }

    function _connectionClosed() {
        _log('CometD connection closed.');
    }

    // Method to enable client side setup and re subscribing to channels
    // upon connection loss and re-connect. For instance in clustered environment.
    function _reconnectChannels() {
        // unsubscribe all previous channels
        _log('Unsubscribing to all channels [' + _subscriptions.length + '].');
        _cometd.clearSubscriptions();
        _subscriptions = [];

        // re-subscribe to all stored channels
        _log('Re-subscribing to all channels [' + _channels.length + '].');
        _cometd.batch(function () {
            $.each(_channels, function (index, channel) {
                _subscribeChannel(channel);
            });
        });
    }

    // Called upon successful subscription to channel
    function _metaSubscribe(message) {
        _log('CometD subscribed to channel: ' + message.subscription);
    }

    // Called upon successful unsubscription from channel
    function _metaUnsubscribe(message) {
        _log('CometD unsubscribed from channel: ' + message.subscription);
        _subscriptions = jQuery.grep(_subscriptions, function (subscription) {
            return subscription[0] != message.subscription;
        });
        _channels = jQuery.grep(_channels, function (channel) {
            return channel.channel != message.subscription;
        });
    }

    // Function that manages the connection status with the Bayeux server
    function _metaConnect(message) {
        if (_cometd.isDisconnected()) {
            // in case of short network failures, we end up here
            _connected = false;
            _connectionClosed();
            return;
        }

        var wasConnected = _connected;
        _connected = message.successful === true;

        if (!wasConnected && _connected) {
            _connectionReestablished(_connected, message);
        } else if (wasConnected && !_connected) {
            _connectionBroken(_connected, message);
        }
    }

    function _metaDisconnect(message) {
        if (message.successful) {
            _connected = false;
        }
    }

    // Function invoked when first contacting the server and
    // when the server has lost the state of this client
    function _metaHandshake(handshake, connectionStatusChangeCallback) {
        if (handshake.successful === true) {
            if (typeof _connectionStatusChangeCallback === 'undefined' || _connectionStatusChangeCallback == null) {
                _connectionStatusChangeCallback = connectionStatusChangeCallback;
            }
            _log('CometD handshake successful :)');
        } else {
            _log('CometD handshake unsuccessful :(');
        }
    }

    // Disconnect when the page unloads
    $(window).on('unload', function () {
        _cometd.disconnect(true);
    });

    function _subscribeChannel(channel) {
        _subscriptions.push(_cometd.subscribe(channel.channel, function (message) {
            //var json = JSON.stringify(message);
            _log('received data: ' + message.data + ', on channel: ' + message.channel);
            channel.callback(message.data);
        }));
    }

    function _unsubscribeChannel(subscription) {
        _cometd.unsubscribe(subscription);
    }

    function _log(object) {
        if (window.console) console.log(object);
    }

    return {

        init: function (useWebsocket, connectionStatusChangeCallback, logLevel) {
            _cometd.websocketEnabled = useWebsocket;
            _connect(connectionStatusChangeCallback, logLevel);
        },

        subscribe: function (channel, callback) {
            channel = '/events/' + channel;
            var channelObject = {channel: channel, callback: callback};
            _log('subscribing, channel: ' + channel + ', callback: ' + callback);
            _subscribeChannel(channelObject);
            _channels.push(channelObject);
        },

        unsubscribe: function (channel) {
            channel = '/events/' + channel;
            _log('current subscriptions:');
            $.each(_subscriptions, function (index, subscription) {
                _log('channel: ' + subscription);

                if (subscription[0] == channel) {
                    _unsubscribeChannel(_subscriptions[index]);
                }
            });
        },

        publish: function (channel, data) {
            //_log('publishing, channel: ' + channel + ', data: ' + JSON.stringify(data));
            _log('publishing, channel: ' + channel + ', data: ' + data);
            _cometd.publish(channel, data);
        },

        disconnectWithCallback: function (callback) {
            _cometd.disconnect(function (disconnectReply) {
                if(typeof callback === "function") {
                    callback(disconnectReply);
                }
            });
        },

        isDisconnected: function () {
            return _cometd.isDisconnected()
        },

        log: function (object) {
            _log(object);
        },

        setCometDLogLevel: function (level) {
            _cometd.setLogLevel(level);
        },

        disconnect : function() {
            _cometd.disconnect(true);
        },

        setMaxNetworkDelay: function(maxNetworkDelayInMs) {
            _cometd.getConfiguration().maxNetworkDelay = maxNetworkDelayInMs;
        },

        setDefaultMaxNetworkDelay: function() {
            _cometd.getConfiguration().maxNetworkDelay = COMETD_DEFAULT_MAX_NETWORK_DELAY;
        },

        isConnected : function() {
            return _connectionStatus;
        },

        setConnectionStatus : function(isConnected) {
            _connectionStatus = isConnected;
        }
    };

})(jQuery);