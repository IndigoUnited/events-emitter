/**
 * MixableEventsEmitter.
 * This is an abstract class because it is meant to be mixed in and not used as a standalone class.
 * This was necessary because the fireEvent had to be declared protected.
 *
 * @author André Cruz <andremiguelcruz@msn.com>
 */
define(['dejavu/AbstractClass', './SubscribeInterface', 'amd-utils/lang/toArray'], function (AbstractClass, SubscribeInterface, toArray) {

    'use strict';

    return AbstractClass.declare({
        $name: 'MixableEventsEmitter',
        $implements: SubscribeInterface,

        _listeners: {},
        _firing: false,

        /**
         * {@inheritDoc}
         */
        on: function (event, fn, $context) {
            var events = this._listeners[event] = this._listeners[event] || [];

            if (this._getListenerIndex(event, fn, $context) === -1) {
                events.push({ fn: fn, context: $context });
            }

            return this;
        },

        /**
         * {@inheritDoc}
         */
        once: function (event, fn, $context) {
            var events = this._listeners[event] = this._listeners[event] || [];

            if (this._getListenerIndex(event, fn, $context) === -1) {
                events.push({ fn: fn, context: $context, once: true });
            }

            return this;
        },

        /**
         * {@inheritDoc}
         */
        off: function ($event, $fn, $context) {
            if (!$fn && arguments.length < 2) {
                this._clearListeners($event);
            } else {
                var index = this._getListenerIndex($event, $fn, $context);

                if (index !== -1) {
                    if (this._firing) {
                        this._listeners[$event][index].fn = this._listeners[$event][index].context = null;
                    } else {
                        if (this._listeners[$event].length === 1) {
                            delete this._listeners[$event];
                        } else {
                            this._listeners[$event].splice(index, 1);
                        }
                    }
                }
            }

            return this;
        },

        /////////////////////////////////////////////////////////////////////////////////////

        /**
         * Emits an event.
         *
         * @param {String}   event   The event name
         * @param {...mixed} [$args] The arguments to pass to each listener
         *
         * @return {MixableEventsEmitter} The instance itself to allow chaining
         */
        _emit: function (event, $args) {
            var listeners = this._listeners[event],
                params,
                x,
                curr;

            if (listeners) {
                params = toArray(arguments),
                params.shift();

                this._firing = true;

                for (x = 0; x < listeners.length; x += 1) {
                    curr = listeners[x];

                    if (curr.fn) {
                        curr.fn.apply(curr.context || this, params);
                        if (curr.once) {
                            listeners.splice(x, 1);
                            x -= 1;
                        }
                    } else {
                        listeners.splice(x, 1);
                        x -= 1;
                    }
                }

                if (listeners.length === 0) {
                    delete this._listeners[event];
                }

                this._firing = false;
            }
        },

        /////////////////////////////////////////////////////////////////////////////////////

        /**
         * Gets a listener index.
         *
         * @param {String}   name      The event name
         * @param {Function} fn        The function
         * @param {Object}   [context] The context passed to the on() function
         *
         * @return {Number} The index of the listener if found or -1 if not found
         */
        _getListenerIndex: function (event, fn, $context) {
            var events = this._listeners[event],
                x,
                curr;

            if (events) {
                for (x = events.length - 1; x >= 0; x -= 1) {
                    curr = events[x];
                    if (curr.fn === fn && curr.context === $context) {
                        return x;
                    }
                }
            }

            return -1;
        },

        /**
         * Removes all listeners of the given event name.
         * If no event is specified, removes all events of all names.
         *
         * @param {String} [$event] The event name
         */
        _clearListeners: function ($event) {
            if ($event) {
                if (this._firing) {
                    this._listeners[$event].length = 0;
                } else {
                    delete this._listeners[$event];
                }
            } else {
                if (this._firing) {
                    for (var key in this._listeners) {
                        this._listeners[key].length = 0;
                    }
                } else {
                    this._listeners = {};
                }
            }
        }
    });
});
