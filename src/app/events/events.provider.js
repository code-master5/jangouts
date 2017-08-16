/**
 * @file      events.provider.js
 * @author    Bimalkant Lauhny <lauhny.bimalk@gmail.com>
 * @copyright MIT License
 * @brief     Creates an event emitter using a subject observable
 *            to which different services can subscribe
 */
(function () {
  'use strict';

  angular.module("janusHangouts.eventsObservable", [])
    .provider('jhEventsObservable', function () {
      /* Rx object */
      var Rx = window.Rx;
      var eventsObservable = new Rx.Subject();
      return {
        $get: function () {
          console.log(eventsObservable);
          return eventsObservable;
        }
      };
    });
})();
