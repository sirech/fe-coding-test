var xing = (function() {
  var slice = [].slice;

  /**
   * Internal helper to return the correct prefix string
   *
   * @param {String} prefix
   */
  function getPrefix(prefix) {
    if (prefix) {
      if (Array.isArray(prefix)) {
        prefix = prefix.join(".");
      }
      prefix += ".";
    }
    return prefix || "";
  }

  /**
   * Observe an event
   *
   * @param {String} event
   * @param {Function} callback method being triggered when event is fired
   *    It receives the event object and the arguments passed into the trigger
   *
   * @example
   *    xing.observe("hello", function(event, userName) { ... });
   */
  function observe(event, callback) {
    var calls = this._callbacks || (this._callbacks = {});
    (calls[event] = calls[event] || []).push(callback);
    return this;
  }

  /**
   * Observe an event
   *
   * @param {String} event
   * @param {Function} callback method being triggered when event is fired
   *    It receives the event object and the arguments passed into the trigger
   * @returns {Object} An Object upon you can call stop and start
   *
   * @example
   *    xing.on("hello", function(event, userName) { ... });
   */
  function on(event, callback) {
    var prefix = getPrefix(event.prefix),
        stopHandlers;

    if (typeof event === "string") {
      this.observe(event, callback);
      return { stop: this.stopObserving.bind(this, event, callback) };
    } else {
      stopHandlers = [];
      Object.keys(event.events).forEach(function(name) {
        stopHandlers.push(on.call(this, prefix + name, event.events[name]));
      }.bind(this));

      return {
        stop: function() {
          stopHandlers.forEach(function(handler) { handler.stop(); });
        }
      };
    }
  }

  /**
   * Fire an event and pass all additional parameters into the callback.
   *
   *
   * @param {String} event
   * @param {*} Splat
   */
  function fire(event) {
    var events = {},
        prefix = getPrefix(event.prefix);
    if (!this._callbacks) {
      return this;
    }

    if (typeof event === "object") {
      if (Array.isArray(event.events)) {
        event.events.forEach(function(name) { events[name] = ""; });
      } else {
        events = event.events;
      }
      Object.keys(events).forEach(function(name) {
        var data = events[name];
        fire.call(this, prefix + name, data);
      }.bind(this));
      return this;
    }

    var list = this._callbacks[event] || [],
      args = slice.call(arguments, 1),
      call;

    // Add an event object to the callback parameters
    args.unshift({
      type: event,
      eventName: event
    });

    // The fire loop invoking the callbacks
    for (var i = 0, l = list.length; i < l; i++) {
      if ((call = list[i])) {
        call.apply(this, args);
      } else {
        // Callback entry was null, i.e. it was remove beforehand.
        // Update the list to not include this entry.
        list.splice(i, 1);
        // Array before splice [cb1, cb2, cb3]
        // After splice at 1 [cb1, cb3]
        // This means we have to stay at index 1
        i--;
        // And we have to reduce the length
        l--;
      }
    }

    return this;
  }

  /**
   * Removes a callback
   *
   * @param {String} event
   * @param {Function} callback Exact reference to the handler,
   *    needed when you only want to remove one specific listener and not all
   */
  function stopObserving(event, callback) {
    var prefix = getPrefix(event.prefix),
        calls,
        list;

    if (typeof event === "string" && event.indexOf(" ") !== -1) {
      list = event.split(" ");
      event = { events: {} };
      list.forEach(function(eventName) { event.events[eventName] = ""; });
    }

    if (typeof event === "object") {
      Object.keys(event.events).forEach(function(name) {
        stopObserving.call(this, prefix + name, event.events[name]);
      }.bind(this));
      return this;
    }

    if (!event) {
      // Clear all callbacks
      this._callbacks = {};
    } else if ((calls = this._callbacks)) {
      // Callbacks in general exist

      if (!callback) {
        // A callback argument was not supplied so we clear all callbacks of
        // an event
        calls[event] = [];

      } else if ((list = calls[event])) {
        // There exists callbacks for the supplied event

        // Find the callback and set it to null
        for (var i = 0, l = list.length; i < l; i++) {
          if (list[i] === callback) {
            list[i] = null;
            break;
          }
        }
        /*
         * Q: Why don't we just splice the callback list here instead of in the
         * fire method?
         *
         * A: Because callbacks might call stopObserving themselves
         * (see testcase for this). If this happens we still have the fire
         * loop running on the same list - which was just spliced - and skip
         * the following callback. This results in the next callback not being
         * called and throwing an error at the end of the loop.
         *
         * E.g. i < l but list[i] is out of bounds as the real length changed.
         *
         * We *could* just work with list copies - which is what the previous
         * implementation did using prototype enumeration functions - but that
         * is wasteful.
         */
      }
    }
    return this;
  }

  return {
    observe: observe,
    on: on,

    // Mirror some methods to match the jQ and Backbone Event API
    off: stopObserving,
    stopObserving: stopObserving,
    trigger: fire
  };
})();

$(function() {
  xing.on("echo", function(event, data) {
    console.log("You called the echo service with: ", data);
  });

});
