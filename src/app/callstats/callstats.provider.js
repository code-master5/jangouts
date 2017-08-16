/** 
 * @file      callstats.service.js
 * @author    Bimalkant Lauhny <lauhny.bimalk@gmail.com>
 * @copyright MIT License
 * @brief     A service that subscribes to eventsObservable
 *            and send stats to callstats.io
 */

(function () {
  'use strict';

  angular.module('CallstatsModule', [])
    .provider('Callstats',  Callstats);

  /**
   * Module to communicate with callstats
   */
  function Callstats() {
    // Step 1: Include callstats.js - done {index.html}
    var callstatsConfig = {
      AppID: null,
      AppSecret: null,
      callstats: null,
      // Step 2: Initialize with AppSecret
      /**
       * Initialize the app with application tokens
       * @param localUserID display of the user
       */
      initializeCallstats: function (localUserID) {
        
        console.log("-- Recieved display as localUserID --", localUserID);
        console.log("This is callstats object -- ", this.callstats);
        
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
          console.log("Initialize return status: errCode= " + csError + " errMsg= " + csErrMsg );
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
          console.log("These are Initialize recieved stats: ", stats);
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
          applicationVersion: "0.4.6" // Application version specified by the developer.
        };
        
      },
      
      // Step 3: Pass the PeerConnection object to the library - adding new Fabric
      /**
       * function for sending PeerConnection Object
       * @param {object} pcObject - RTCPeerConnectionObject
       */
      sendPCObject: function (pcObject, remoteUserID, conferenceID) {
        
        console.log("::: These are sendPCObject recieved parameters ::: ", pcObject, remoteUserID, conferenceID);
        
        // PeerConnection carrying multiple media streams on the same port
        var usage = this.callstats.fabricUsage.multiplex;
        
        /**
         * callback asynchronously reporting failure or success for pcObject.
         * @param msg error message
         */
        function pcCallback (err, msg) {
          console.log("Monitoring status: "+ err + " msg: " + msg);
        }
        
        if (remoteUserID && conferenceID && pcObject) {
          //         this.callstats.addNewFabric(pcObject, remoteUserID, usage, conferenceID, pcCallback);
        } else {
          console.log("Error: Faulty Parameters! ", pcObject, remoteUserID, conferenceID);
        }
        
      },
      
      // Step 4: Error Reporting
      /**
       * function reporting error and WebRTC functionType to callstats.io
       * @param err DomError
       * @param functionType WebRTC function in which error occurred
       */
      reportErrors: function (pcObject, conferenceID, err, functionType) {
        console.log("::: reporting error ::: ", err, functionType);
        //       this.callstats.reportError(pcObject, conferenceID, this.callstats.webRTCFunctions[functionType], err);
      },
      
      // OPTIONAL STEPS
      
      // Step 5: Send fabric events
      /**
       * function reporting fabric events to callstats.io
       * @param err DomError
       */
      sendEvents: function (pcObject, conferenceID, event) {
        console.log("::: Sending Event ::: ", event);
        //this.callstats.sendFabricEvent(pcObject, this.callstats.fabricEvent[event], conferenceID);
      },
      subscribeToEventsSubject: function(Observable) {
      
        Observable.subscribe(eventHandler.bind(this));
        
        function eventHandler(event) {
          console.log("Received Event: ", event);
          var eventType = event.type;
          switch(eventType) {
            case 'username':
              this.initializeCallstats(event.username);
              break;
            default: 
              break;
          }
        }
      }
    }; 
    
    return {
      $get: function() {
        return callstatsConfig;
      },
      $set: function(key, val) {
        callstatsConfig[key] = val;
      }
    };
  }
}());
