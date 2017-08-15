(function () {
  'use strict';

  angular.module("janusHangouts.eventsObservable", [])
    .provider('jhEventsObservable', function () {
      var eventsObservable = new Rx.Subject();

      return {
        $get: function () {
          return eventsObservable;
        }
      };
    });
})();
