/*
 * Copyright (C) 2015 SUSE Linux
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE.txt file for details.
 */

(function () {
  'use strict';

  angular.module('janusHangouts')
    .factory('FeedConnection', feedConnectionFactory);

  feedConnectionFactory.$inject = ['ConnectionConfig', 'CallstatsService'];

  /**
   * Manages the connection of a feed to the Janus server
   *
   * @constructor
   *
   * @param {string} role - possible values
   *        * main: main publisher feed
   *        * subscriber: subscriber feed
   *        * screen: screen-sharing publisher feed
   *        * window: screen-sharing publisher feed
   *  In most browsers, "screen" and "window" are equivalent. Firefox uses the
   *  former to share the whole screen and the latter for sharing individual
   *  windows.
   */
  function feedConnectionFactory(ConnectionConfig, CallstatsService) {
    return function(pluginHandle, roomId, roomDesc, role) {
      var that = this;
      console.log("Inside feed-connection: ", roomId, roomDesc);
      this.pluginHandle = pluginHandle;
      this.role = role || "subscriber";
      this.isDataOpen = false;
      this.roomDesc = roomDesc;
      this.config = null;
      console.log(this.role + " plugin attached (" + pluginHandle.getPlugin() + ", id=" + pluginHandle.getId() + ")");

      this.destroy = function() {
        this.config = null;
        console.log("::: Detach called :::");
        CallstatsService.sendEvents(this.pluginHandle.webrtcStuff.pc, 
                                  this.roomDesc,
                                  "fabricTerminated"); 
        this.pluginHandle.detach();
      };

     this.register = function(display, pin) {
        console.log("::: Registering Peer Connection!");
        var register = { "request": "join", "room": roomId, "ptype": "publisher", "display": display, "pin": pin || "" };
        pluginHandle.send({"message": register});
      };

      this.listen = function(feedId, pin) {
        console.log("::: Listen Peer Connection!");
        var listen = { "request": "join", "room": roomId, "ptype": "listener", "feed": feedId, "pin": pin || "" };
        pluginHandle.send({"message": listen});
      };

      this.handleRemoteJsep = function(jsep) {
        pluginHandle.handleRemoteJsep({jsep: jsep});
      };

      this.sendData = function(data) {
        pluginHandle.data(data);
      };

      /**
       * Negotiates WebRTC by creating a webRTC offer for sharing the audio and
       * (optionally) video with the janus server. The audio is optionally muted.
       * On success (the stream is created and accepted), publishes the corresponding
       * feed on the janus server.
       *
       * @param {object} options - object with the noCamera boolean flag, muted boolean flag,
       * and some callbacks (success, error)
       */
      this.publish = function(options) {
        console.log("::: Publishing Starts! :::");
        options = options || {};

        var media = {videoRecv: false, audioRecv: false};
        var cfg = {video: true, audio: true};
        if (this.role === "main") {
          if (options.muted){
            cfg.audio = false;
          }
          if (options.noCamera) {
            media.videoSend = false;
            cfg.video = false;
          } else {
            media.videoSend = true;
          }
          media.audioSend = true;
          media.data = true;
          cfg.data = true;
        } else {
          // Publishing something but not "main" -> screen sharing
          cfg.audio = false;
          cfg.data = false;
          media.video = this.role;
          media.audioSend = false;
          media.data = false;
        }
        pluginHandle.createOffer({
          media: media,
          success: function(jsep) {
            console.log("Got publisher SDP!", jsep);
            that.config = new ConnectionConfig(pluginHandle, cfg, jsep);
            console.log("::: Publish options ::: ", options);
            // Call the provided callback for extra actions
            if (options.success) { options.success(); }
          },
          error: function(error) {
            console.error("WebRTC error publishing", error);
            CallstatsService.reportErrors(pluginHandle.webrtcStuff.pc, that.roomDesc, error, "createOffer");
            // Call the provided callback for extra actions
            if (options.error) { options.error(); }
          }
        });
      };

      /**
       * Negotiates WebRTC by creating a WebRTC answer for subscribing to
       * to a feed from the janus server.
       */
      this.subscribe = function(jsep) {
        console.log("::: Creating answer :::");
        var rjsep = jsep;
        pluginHandle.createAnswer({
          jsep: jsep,
          media: {
            audioSend: false,
            videoSend: false,
            data: true
          },
          success: function(jsep) {
            console.log("Got SDP!");
            console.log("::: compare jseps :::", rjsep, jsep);
            var start = { "request": "start", "room": roomId };
            pluginHandle.send({message: start, jsep: jsep});
          },
          error: function(error) {
            console.error("WebRTC error subscribing");
            CallstatsService.reportErrors(pluginHandle.webrtcStuff.pc, that.roomDesc, error, "createAnswer");
            console.error(error);
          }
        });
      };

      /**
       * Sets the configuration flags
       *
       * @param {object} options - object containing
       *        * values: object with the wanted values for the flags
       *        * ok: callback to execute on confirmation from Janus
       */
      this.setConfig = function(options) {
        if (this.config) {
          this.config.set(options);
        } else {
          this.config = new ConnectionConfig(pluginHandle, options.values, null, options.ok);
        }
        
      };

      /**
       * Gets the configuration flags
       *
       * @returns {object} values of the audio and video flags
       */
      this.getConfig = function() {
        if (this.config) {
          return this.config.get();
        }
      };

      /**
       * Processes the confirmation (received from Janus) of the ongoing
       * config request
       */
      this.confirmConfig = function() {
        if (this.config) {
          return this.config.confirm();
        }
      };

      /**
       * Handler for the ondataopen event
       */
      this.onDataOpen = function() {
        this.isDataOpen = true;
      };
    };
  }
})();
