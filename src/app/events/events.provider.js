/**
 * @file      events.provider.js
 * @author    Bimalkant Lauhny <lauhny.bimalk@gmail.com>
 * @copyright MIT License
 * @brief     Creates an event emitter using a subject observable
 *            to which different services can subscribe
 */
(function () {
  'use strict';

  angular.module("janusHangouts.eventsProvider", [])
    .provider('jhEventsProvider', function () {
      var eventsConfig = {
        // opaqueId is any meaningful string that eventsProvider should
        // provide to any external service
        opaqueId: null,
        // eventsSubject stores a reference to window.Rx object
        eventsSubject: null,
        emitEvent: emitEvent
      };
       
      /**
       *  Emits event after adding opaqueId and timestamp to it 
       *  @param {object} event - carries 'type' and 'data' for event
       */
      function emitEvent(event) {
        event['opaqueId'] = eventsConfig.opaqueId;
        // timestamp shows the time when event gets emitter
        event['timestamp'] = Date.now();
        eventsConfig.eventsSubject.onNext(event);
      }
      
      return {
        $get: function () {
          return eventsConfig;
        },
        $set: function(key, val) {
          eventsConfig[key] = val;
        }
      };
    });
})();
