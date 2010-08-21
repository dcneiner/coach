/*!
 * Coach, the JavaScript Dribbble API Wrapper
 * Copyright (c) 2010 by Doug Neiner
 *
 * A few items in this wrapper were gleaned from 
 * http://code.google.com/p/halfcourtshot/
 *
 * This library is not provided, maintained or endorsed by Dribbble, LLC
 *
 * License: Dual licensed under MIT or GPL
 * Source: http://github.com/dcneiner/coach
 */
  
var Coach = (function (undefined) {
  var timer = null,
      counter = 0,
      paused = false;
      callback_counter = 0,
      queue = [],
      endpoint = "http://api.dribbble.com",
      
  next_callback = function (callback) {
    callback_counter = callback_counter + 1;
    Coach.callbacks['c' + callback_counter] = function (data) {
      callback.call(Coach, data);
      
      if (Coach.onProcess) {
        Coach.onProcess.call(Coach);
      }
    };
    return 'Coach.callbacks.c' + callback_counter;
  },
  
  start_timer = function () {
    timer = window.setTimeout(function () {
      counter = 0;
      
      if (paused == true && Coach.onResume) {
        Coach.onResume.call(Coach);
      }
      
      paused = false;
      
      process_queue();
      timer = null;
    }, 60000); // 60 Seconds
  },
  
  process_queue = function () {
    var length = queue.length, i = 0;
    
    if (length > 60) {
      length = 60;
    }
    for (; i < length; i = i + 1) {
      make_call(queue.shift());
    }
  },
  
  make_call = function (url) {
    if (!timer) {
      start_timer(); // start tracking calls
    }
    
    if (counter > 59) {
      queue.push(url);
      if (paused === false) {
        paused = true;
        
        if (Coach.onPause) {
          Coach.onPause.call(Coach);
        }
      }
    } else {
      counter = counter + 1;
      
      // Create script element
      var s = document.createElement('script');
      s.type = "text/javascript";
      s.src = url;
      
      // Append to document
      document.getElementsByTagName('head')[0].appendChild(s);
    }
  };
      
  return {
    callbacks: {},
    
    onPause: null,   // function () { this == Coach } Called when 60 calls are exhausted
    onResume: null,  // function () { this == Coach } Called when timer is reset
    onProcess: null, // function () { this == Coach } Called each time an item is processed
    
    shot: function (id, callback) {
      var url = [endpoint, 'shots', id];
      this.api(url, callback);
      return Coach;
    },
    
    shots: function (list, page, per_page, callback) {
      if (list === 'debuts' || list === 'everyone' || list === 'popular') {
        var url = [endpoint, 'shots', list];
        return this.api(url, page, per_page, callback);
      }
      return Coach;
    },
    
    player: function (id, callback) {
      var base = this,
          base_url = [endpoint, 'players', id];
          
      return {
        get: function (callback) {
          base.api(base_url, callback);
          return base;
        },
        shots: function (following, page, per_page, callback) {
          var url = base_url.slice();
          url.push('shots');
          
          if (typeof following !== "boolean") {
            callback = per_page;
            per_page = page;
            page = following;
          } else {
            if (following === true) {
              url.push('following');
            }
          }
          
          base.api(url, page, per_page, callback);
          return base;
        },
        followers: function (callback) {
          var url = base_url.slice();
          url.push('followers');
          
          base.api(url, callback);
          return base;
        },
        following: function (callback) {
          var url = base_url.slice();
          url.push('following');
          
          base.api(url, callback);
          return base;
        },
        draftees: function (callback) {
          var url = base_url.slice();
          url.push('draftees');
          
          base.api(url, callback);
          return base;
        }
      };
    },
    
    api: function (url, page, per_page, callback) {
      var query = {
        r: Math.floor(Math.random() * 9999999)
      },
      query_string = [], x;
      
      if (typeof url !== "string") {
        url = url.join('/');
      }
      
      if (typeof page === "function") {
        callback = page;
        page = 
        per_page = undefined;
      }
      
      if (typeof per_page === "function") {
        callback = per_page;
        per_page = undefined;
      }
      
      if (typeof callback !== "function") {
        return Coach; // Must have a callback
      }
      
      query.callback = next_callback(callback);
      
      if (page !== undefined) {
        query.page = page;
      }
      
      if (per_page !== undefined) {
        query.per_page = per_page;
      }
      
      // Take the object and create an array of key=encoded_value
      for (x in query) {
        query_string.push([x, encodeURIComponent(query[x])].join('='));
      }
      
      url = url + '?' + query_string.join('&');
      
      make_call(url);
      
      return Coach;
    },
    
    api_url: endpoint
  };
}());