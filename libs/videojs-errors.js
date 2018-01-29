/**
 * videojs-errors
 * @version 1.1.1
 * @copyright 2016 Brightcove
 * @license Apache-2.0
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.videojsErrors = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":1}],3:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

var _globalDocument = require('global/document');

var _globalDocument2 = _interopRequireDefault(_globalDocument);

var FlashObj = _videoJs2['default'].getComponent('Flash');

// Default options for the plugin.
var defaults = {
  header: '',
  code: '',
  message: '',
  timeout: 45 * 1000,
  errors: {
    '1': {
      type: 'MEDIA_ERR_ABORTED',
      headline: 'The video download was cancelled'
    },
    '2': {
      type: 'MEDIA_ERR_NETWORK',
      headline: 'The video connection was lost, please confirm you are ' + 'connected to the internet'
    },
    '3': {
      type: 'MEDIA_ERR_DECODE',
      headline: 'The video is bad or in a format that cannot be played on your browser'
    },
    '4': {
      type: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
      headline: 'This video is either unavailable or not supported in this browser'
    },
    '5': {
      type: 'MEDIA_ERR_ENCRYPTED',
      headline: 'The video you are trying to watch is encrypted and we do not know how ' + 'to decrypt it'
    },
    'unknown': {
      type: 'MEDIA_ERR_UNKNOWN',
      headline: 'An unanticipated problem was encountered, check back soon and try again'
    },
    '-1': {
      type: 'PLAYER_ERR_NO_SRC',
      headline: 'No video has been loaded'
    },
    '-2': {
      type: 'PLAYER_ERR_TIMEOUT',
      headline: 'Could not download the video'
    }
  }
};

/**
 * Monitors a player for signs of life during playback and
 * triggers PLAYER_ERR_TIMEOUT if none occur within a reasonable
 * timeframe.
 */
var initPlugin = function initPlugin(player, options) {
  var monitor = undefined;
  var listeners = [];

  // clears the previous monitor timeout and sets up a new one
  var resetMonitor = function resetMonitor() {
    _globalWindow2['default'].clearTimeout(monitor);
    monitor = _globalWindow2['default'].setTimeout(function () {
      if (player.error() || player.paused() || player.ended()) {
        // never overwrite existing errors or display a new one
        // if the player is paused or ended.
        return;
      }

      player.error({
        code: -2,
        type: 'PLAYER_ERR_TIMEOUT'
      });
    }, options.timeout);

    // clear out any existing player timeout
    if (player.error() && player.error().code === -2) {
      player.error(null);
    }
  };

  // clear any previously registered listeners
  var cleanup = function cleanup() {
    var listener = undefined;

    while (listeners.length) {
      listener = listeners.shift();
      player.off(listener[0], listener[1]);
    }
    _globalWindow2['default'].clearTimeout(monitor);
  };

  // creates and tracks a player listener if the player looks alive
  var healthcheck = function healthcheck(type, fn) {
    var check = function check() {
      // playback isn't expected if the player is paused, shut
      // down monitoring
      if (player.paused()) {
        return resetMonitor();
      }
      // playback isn't expected once the video has ended
      if (player.ended()) {
        return resetMonitor();
      }
      fn.call(this);
    };

    player.on(type, check);
    listeners.push([type, check]);
  };

  var onPlayStartMonitor = function onPlayStartMonitor() {
    var lastTime = 0;

    cleanup();

    // if no playback is detected for long enough, trigger a timeout error
    resetMonitor();
    healthcheck(['timeupdate', 'adtimeupdate'], function () {
      var currentTime = player.currentTime();

      if (currentTime !== lastTime) {
        lastTime = currentTime;
        resetMonitor();
      }
    });
    healthcheck('progress', resetMonitor);
  };

  var onPlayNoSource = function onPlayNoSource() {
    if (!player.currentSrc()) {
      player.error({
        code: -1,
        type: 'PLAYER_ERR_NO_SRC'
      });
    }
  };

  var onErrorHandler = function onErrorHandler() {
    var display = undefined;
    var details = '';
    var error = player.error();
    var content = _globalDocument2['default'].createElement('div');

    // In the rare case when `error()` does not return an error object,
    // defensively escape the handler function.
    if (!error) {
      return;
    }
    error = _videoJs2['default'].mergeOptions(error, options.errors[error.code || 0]);
    if (error.message) {
      details = '<div class="vjs-errors-details">' + player.localize('Technical details') + '\n        : <div class="vjs-errors-message">' + player.localize(error.message) + '</div>\n        </div>';
    }
    if (error.code === 4 && !FlashObj.isSupported()) {
      var flashMessage = player.localize(' * If you are using an older browser' + ' please try upgrading or installing Flash.');

      details += '<span class="vjs-errors-flashmessage">' + flashMessage + '</span>';
    }
    display = player.getChild('errorDisplay');
    // The code snippet below is to make sure we dispose any child closeButtons before
    // making the display closeable
    if (display.getChild('closeButton')) {
      display.removeChild('closeButton');
    }
    // Make the error display closeable, and we should get a close button
    display.closeable(true);
    content.className = 'vjs-errors-dialog';
    content.id = 'vjs-errors-dialog';
    content.innerHTML = '<div class="vjs-errors-content-container">\n        <h2 class="vjs-errors-headline">' + this.localize(error.headline) + '</h2>\n          ' + details + '\n        </div>\n        <div class="vjs-errors-ok-button-container">\n          <button class="vjs-errors-ok-button">' + this.localize('OK') + '</button>\n        </div>';
    display.fillWith(content);
    // Get the close button inside the error display
    display.contentEl().firstChild.appendChild(display.getChild('closeButton').el());
    if (player.width() <= 600 || player.height() <= 250) {
      display.addClass('vjs-xs');
    }

    var okButton = display.el().querySelector('.vjs-errors-ok-button');

    _videoJs2['default'].on(okButton, 'click', function () {
      display.close();
    });
  };

  var onDisposeHandler = function onDisposeHandler() {
    cleanup();

    player.removeClass('vjs-errors');
    player.off('play', onPlayStartMonitor);
    player.off('play', onPlayNoSource);
    player.off('dispose', onDisposeHandler);
    player.off('error', onErrorHandler);
  };

  var reInitPlugin = function reInitPlugin(newOptions) {
    onDisposeHandler();
    initPlugin(player, _videoJs2['default'].mergeOptions(defaults, newOptions));
  };

  player.on('play', onPlayStartMonitor);
  player.on('play', onPlayNoSource);
  player.on('dispose', onDisposeHandler);
  player.on('error', onErrorHandler);

  player.ready(function () {
    player.addClass('vjs-errors');
  });

  player.errors = reInitPlugin;
};

/**
 * Initialize the plugin. Waits until the player is ready to do anything.
 */
var errors = function errors(options) {
  initPlugin(this, _videoJs2['default'].mergeOptions(defaults, options));
};

// Register the plugin with video.js.
_videoJs2['default'].plugin('errors', errors);

exports['default'] = errors;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"global/document":2,"global/window":3}]},{},[4])(4)
});