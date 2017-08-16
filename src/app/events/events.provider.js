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
        eventsSubject: null
      };
      
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
