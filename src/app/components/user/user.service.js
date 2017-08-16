/*
 * Copyright (C) 2015 SUSE Linux
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE.txt file for details.
 */

(function () {
  'use strict';

  angular.module('janusHangouts')
    .service('UserService', UserService);

  UserService.$inject = ['localStorageService'];

  function UserService(localStorageService) {
    var USER_SETTINGS_KEY = 'userSettings'; // 'const' is not available in all platforms.
    this.user = null;
    this.settings = localStorageService.get(USER_SETTINGS_KEY) || {};

    /**
     * Returns the current (signed in) user.
     * @returns {object} An object representing the user like
     *                   { username: 'some-name' }
     */
    this.getUser = function() {
      return this.user;
    };

    /**
     * Sign in a user.
     * @param   {string} username Username.
     * @returns {object} An object representing the user like
     */
    this.signin = function(username) {
      this.setSetting('lastUsername', username);
      this.user = { username: username };
    };

    /**
     * Get all user settings.
     * @returns {object} An object containing all the settings.
     */
    this.getSettings = function() {
      return this.settings;
    };

    /**
     * Get the value for a given user setting.
     * @param   {string} key User setting key.
     * @returns {}       The value for the given setting.
     */
    this.getSetting = function(key) {
      if (key === 'lastDeviceId' && this.settings[key] === undefined){
        this.setSetting('lastDeviceId', randomString(20));
      }
      return this.settings[key];
    };

    /**
     * Remove a user setting.
     * @param   {string} key User setting key.
     * @returns {boolean}    True if the element was removed.
     */
    this.removeSetting = function(key) {
      delete this.settings[key];
      this.storeSettings();
    };

    /**
     * Clear user settings.
     * @returns {boolean} True if storage was cleared.
     */
    this.clearSettings = function() {
      this.settings = {};
      return localStorageService.clearAll(USER_SETTINGS_KEY);
    };

    /**
     * Set the value for a given user setting.
     * @param   {string} key User setting key.
     * @param   {}       value User setting value.
     */
    this.setSetting = function(key, value) {
      this.settings[key] = value;
      this.storeSettings();
    };

    /**
     * Store settings in the local storage.
     *
     * This function is not supposed to be called by users of the API.
     *
     * @private
     */
    this.storeSettings = function() {
      localStorageService.set(USER_SETTINGS_KEY, this.settings);
    };
    
    // Pin entered by user
    this.enteredPin = null;
    
    /**
     * Returns the pin as entered by the current user.
     * @returns string A string representing the user like
     *                
     */
    this.getPin = function() {
      return this.enteredPin;
    };

    /**
     * Set the pin to value entered by current user.
     * @param   {string} val User entered pin.
     */
    this.setPin = function(value) {
      this.enteredPin = value;
    };
    
    /**
     * Function for generating deviceID as a random string
     * @param {len} length of the generated random string
     */
    var randomString = function(len) {
      var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var randomString = '';
      for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
      }
      return randomString;
    };
    
  }
})();
