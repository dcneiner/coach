# Coach, the JavaScript Dribbble API Wrapper

**Author:** [Doug Neiner](http://dougneiner.com)  
**License:** Dual licensed under the [MIT](http://creativecommons.org/licenses/MIT/) or [GPL](http://creativecommons.org/licenses/GPL/2.0/)  
**Copyright:** 2010 by Doug Neiner

Coach is a simple JavaScript API wrapper for the [Dribbble API](http://dribbble.com/api). Right now the API is in Beta, and as such is somewhat limited. Anything you can currently do with the API, you can do with this wrapper.

*Everything with this API is asynchronous, so a callback is required on almost every method.*

## Request Limiting

The Dribbble API limits requests to 60 every minute. This library keeps track of the calls made on a single instance and will queue items when the 60 request limit is exceded. Once the 60 seconds are up, the queue is processed and the remaining items (up to the next 60) get processed.

Hooks are availible so you can provide user feedback when the different events occur.

## Hooks

Inside the callbacks, `this` always refers to the `Coach` object.

* `Coach.onPause`  
  Triggered when rate limit is exceeded and the first item is queued
* `Coach.onResume`  
  Triggered after a pause has occured, but right after the rate limit is reset
* `Coach.onProcess`  
  Triggered after the callback is run on every request
  
## Chaning

Similar to the pattern used by jQuery, Coach supports chaining. The following would issue three requests to the Dribble API:

    Coach
      .shots('popular', 1, 10, function (shots) {
        ...
      })
      .player('dcneiner')
        .get(function (player) {
          ...
        })
        .shots(function (player_shots) {
          ...
        });

## Using Coach

### The Base `Coach` Object

**Coach.shot(id, callback)** -- *Get the details for a specific shot*

* `id` -- An integer id of the shot on Dribbble. 
* `callback` -- Executed once data is returned from Dribbble. A single data object is passed to the callback.

*Example:*

    Coach.shot(14, function (shot) {
      ...
    });
    
    
**Coach.shots(list, [page], [per_page], callback)** -- *Get a list of `debuts`, `everyone`, `popular`*

* `list` -- Can be one of three string values: `"debuts"`, `"everyone"`, `"popular"`
* `page` -- *Optional:* Integer specifying which of the result pages to return
* `per_page` -- *Optional:* Integer specifying how many results to return at once. Value can range from `1` to `30`. Default for the Dribbble API is `15`
* `callback` -- Executed once data is returned from Dribbble. A single data object is passed to the callback.

*Examples:*

    // Return first 15 shots from the popular stream
    Coach.shots('popular', function (shots) {
      ...
    });
    
    // Return shots 26-50 from the everyone stream
    Coach.shots('everyone', 2, 25, function (shots) {
      ...
    });

**Coach.player(id)** -- *Get a Coach Player object for a specific Dribbble user*

* `id` -- The string username or integer id of the player on Dribbble.
* returns: A `Player` object configured based on the `id`

**Important:** This does not make any calls to the Dribbble API directly. It simply configures a secondary `Player` object of the Coach library for use with the `players` aspect of the API.

*Examples:*

    Coach
      // Return the player object
      .player('dcneiner')
      
      // Actually call the API
      .get(function (player) { 
        ...
      });

    // Or store the player in a variable to make multiple 
    // API calls for the player.
    var player = Coach.player('dcneiner');
    
    player.get(function (player) {
      ...
    });

    player.shots(function (shots) {
      ...
    });

**Coach.api(url, [page], [per_page], callback)** -- *Executes a call against the Dribbble API*

* `url` -- The URL can either be a preformatted url as a `String` (`http://api.dribble.com/players/dcneiner`), or it can be URL parts in an `Array` (`['http://api.dribbble.com','players','dcneiner']`). Internally, Coach uses an `Array` to build the URL, and this function will take care of turning it into the final `String` used for the request. This URL cannot contain a query string (`?...`) as it is currently added by this method. This may change in the future.
* `page` -- *Optional:* Integer specifying which of the result pages to return
* `per_page` -- *Optional:* Integer specifying how many results to return at once. Value can range from `1` to `30`. Default for the Dribbble API is `15`
* `callback` -- Executed once data is returned from Dribbble. A single data object is passed to the callback.

**Coach.api_url** -- *Read-only variable containing the Dribbble API Endpoint*

### The Coach `Player` Object

**Player.get(callback)** -- *Get a Player's details from Dribbble*

* `callback` -- Executed once data is returned from Dribbble. A single data object is passed to the callback.

*Examples:*

    Coach
      .player('dcneiner')
      .get(function (player) {
        ...
      });
    
**Player.shots([following], [page], [per_page], callback);** -- *Get a Player's shots, and optionally the shots of who they are following.*

* `following` -- *Optional:* A `true` or `false` value that determines if the shots returned should be from the Player's following list, or the Player's own shots. Defaults to `false`.
* `page` -- *Optional:* Integer specifying which of the result pages to return
* `per_page` -- *Optional:* Integer specifying how many results to return at once. Value can range from `1` to `30`. Default for the Dribbble API is `15`
* `callback` -- Executed once data is returned from Dribbble. A single data object is passed to the callback.

*Examples:*
    
    # Get a players shots
    Coach
      .player('dcneiner')
      .shots(function (shots) {
        ...
      });
    
    # Get shots from the player's following list
    Coach
      .player('dcneiner')
      .shots(true, function (shots) {
        ...
      });

**Player.followers(callback)** -- *Get a Player's Followers*

* `callback` -- Executed once data is returned from Dribbble. A single data object is passed to the callback.

*Example:*

    Coach
      .player('dcneiner')
      .followers(function (followers) {
        ...
      });
    
**Player.following(callback);** -- *Get a list of who a Player is Following*

* `callback` -- Executed once data is returned from Dribbble. A single data object is passed to the callback.

*Example:*

    Coach
      .player('dcneiner')
      .following(function (following) {
        ...
      });
    
**Player.draftees(callback);** -- *Get a Player's Draftees*

* `callback` -- Executed once data is returned from Dribbble. A single data object is passed to the callback.

*Example:*    

    Coach
      .player('dcneiner')
      .draftees(function (draftees) {
        ...
      });