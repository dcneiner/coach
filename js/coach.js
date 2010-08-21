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

  // Private Methods and Variables
  var 
  
  // Timer variable used internally to keep track
  // of request limitations
  timer = null,
  
  // Tied to the timer, this counter increments on each
  // call made to the Dribbble API. When it its 60, subsequent
  // calls are queued instead of directly requested.
  counter = 0,
  
  // When the first item is pushed onto the queue, this is changed
  // to true. When the rate limit is reset, this value is changed
  // back to false.
  paused = false,
  
  // This value is incremented and used to ensure a unique function
  // name for each callback used with the JSON-P requests.
  callback_counter = 0,
  
  // Stores a list of URL requests against the Dribbble API when the
  // request limit is exceeded.
  queue = [],
  
  // Dribbble API Endpoint
  endpoint = "http://api.dribbble.com",
      
  // Creates a new unique callback, and returns the full
  // Object/Function name for use with a JSON-P request.
  // It will trigger Coach.onProccess after calling the `callback`
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
  
  // Starts 60 second timer and provides logic for processing the queue
  // as needed after the rate limit is reset.
  start_timer = function () {
    timer = window.setTimeout(function () {
      counter = 0;
      
      if (paused === true && Coach.onResume) {
        Coach.onResume.call(Coach);
      }
      
      paused = false;
      
      process_queue();
      timer = null;
    }, 60000); // 60 Seconds
  },
  
  // Always empties entire queue into the make_call method.
  // If queue contains more than 60 items, they will be pushed
  // back onto the queue by the make_call method, but additionally
  // paused will be set correctly, and the hooks triggered as needed.
  process_queue = function () {
    for (var i = 0; i < queue.length; i = i + 1) {
      make_call(queue.shift());
    }
  },
  
  // Attempts to make a request against the Dribbble API. However,
  // if the API rate limit is exceeded, it will instead add the request
  // to the queue to be processed with the rate limit is reset.
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
  
  
  // Public Methods and Variables
  return {
    callbacks: {},
    
    onPause: null,   // function () { this == Coach } Called when 60 calls are exhausted
    onResume: null,  // function () { this == Coach } Called when timer is reset
    onProcess: null, // function () { this == Coach } Called each time an item is processed
    
    // Get a single shot by id
    shot: function (id, callback) {
      var url = [endpoint, 'shots', id];
      this.api(url, callback);
      return Coach; // Don't break the chain
    },
    
    // Get a list of general list shots. Correct values for 
    // list are `debuts`, `everyone` or `popular`
    shots: function (list, page, per_page, callback) {
      if (list === 'debuts' || list === 'everyone' || list === 'popular') {
        var url = [endpoint, 'shots', list];
        return this.api(url, page, per_page, callback);
      }
      return Coach; // Don't break the chain
    },
    
    // Returns a Player object, configured for the player `id`.
    // The `id` can either be the player username or the player integer id
    player: function (id, callback) {
      var base = this,
          base_url = [endpoint, 'players', id];
          
      return {
        // Acutally get the player info from Dribbble
        get: function (callback) {
          base.api(base_url, callback);
          return base; // Don't break the chain
        },
        
        // Get the player's shots (following = false)
        // Get the shots from the player's follwing list (following = true)
        shots: function (following, page, per_page, callback) {
          var url = base_url.slice();
          url.push('shots');
          
          if (typeof following !== "boolean") {
            // Following is optional. Shift paramater values if
            // following is not provided.
            callback = per_page;
            per_page = page;
            page = following;
          } else {
            if (following === true) {
              url.push('following');
            }
          }
          
          base.api(url, page, per_page, callback);
          return base; // Don't break the chain
        },
        
        // Get a player's followers
        followers: function (callback) {
          var url = base_url.slice();
          url.push('followers');
          
          base.api(url, callback);
          return base; // Don't break the chain
        },
        
        // Get who a player is following
        following: function (callback) {
          var url = base_url.slice();
          url.push('following');
          
          base.api(url, callback);
          return base; // Don't break the chain
        },
        
        // Get a player's draftees
        draftees: function (callback) {
          var url = base_url.slice();
          url.push('draftees');
          
          base.api(url, callback);
          return base; // Don't break the chain
        }
      };
    },
    
    api: function (url, page, per_page, callback) {
      var query = {
        // Set a random query_string so the request is not cached
        r: Math.floor(Math.random() * 9999999)
      },
      query_string = [], x;
      
      // If url is passed in as an Array, join it on `/`
      if (typeof url !== "string") {
        url = url.join('/');
      }
      
      // Handle optional paramaters
      if (typeof page === "function") {
        callback = page;
        page = 
        per_page = undefined;
      }

      // Handle optional paramaters      
      if (typeof per_page === "function") {
        callback = per_page;
        per_page = undefined;
      }
      
      // Return now if no callback is set. Callback is required
      if (typeof callback !== "function") {
        return Coach; // Must have a callback
      }
      
      // Setup callback for JSON-P request
      query.callback = next_callback(callback);
      
      
      // Handle paging values
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
      
      // Build URL
      url = url + '?' + query_string.join('&');
      
      make_call(url);
      
      return Coach; // Don't break the chain
    },
    
    api_url: endpoint
  };
}());