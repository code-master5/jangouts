/*
 * Copyright (C) 2015 SUSE Linux
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE.txt file for details.
 */

(function () {
  'use strict';

  angular.module('janusHangouts')
    .service('CallstatsService',  CallstatsService);

    CallstatsService.$inject = [];

  /**
   * Service to communication with callstats
   * @constructor
   * @memberof module:janusHangouts
   */
  function CallstatsService() {
    
    // Step 1: Include callstats.js - done {index.html}
    
    this.AppID     = "724446896";
    this.AppSecret = "/BKw/++t+DXe:UCxvwuXdkE6AIuxHXRj5PnaKLNeAgNZdp6rGShdWNmc=";
    this.callstats = null;
    this.initializeCallstats = initializeCallstats;
    
    // Step 2: Initialize with AppSecret
    /**
     * Initialize the app with application tokens
     * @param localUserID display of the user
     */
    function initializeCallstats(localUserID) {
      
      console.log("-- Recieved display as localUserID --", localUserID);
      this.callstats = new window.callstats();
      
      var res = this.callstats.initialize(this.AppID,
                                          this.AppSecret,
                                          localUserID,
                                          csInitCallback,
                                          csStatsCallback,
                                          configParams);
      
      console.log("::: This is response object returned by callstats.io ::: ", res);
      /**
       * reports different success and failure cases
       * @param {string} csErrMsg a descriptive error returned by callstats.io
       */
      function csInitCallback(csError, csErrMsg) {
          console.log("Status: errCode= " + csError + " errMsg= " + csErrMsg );
      }
      
      var reportType = {
        inbound: 'inbound',
        outbound: 'outbound'
      };
      
      /**
       * callback function to receive the stats
       * @param stats
       */
      function csStatsCallback (stats) {
        var ssrc;
        for (ssrc in stats.streams) {
          console.log("SSRC is: ", ssrc);
          var dataSsrc = stats.streams[ssrc];
          console.log("SSRC Type ", dataSsrc.reportType);
          if (dataSsrc.reportType === reportType.outbound) {
            console.log("RTT is: ", dataSsrc.rtt);
          } else if (dataSsrc.reportType === reportType.inbound) {
            console.log("Inbound loss rate is: ", dataSsrc.fractionLoss);
          }
        }
      }
      
      var configParams = {
        disableBeforeUnloadHandler: false, // disables callstats.js's window.onbeforeunload parameter.
        applicationVersion: "0.4.5" // Application version specified by the developer.
      };
      
    }
    
    // Step 3: Pass the PeerConnection object to the library
  }
}());
