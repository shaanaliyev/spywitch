// Twitch Data Collector:
export class twServices {
  #oauth;
  #clientId;
  constructor(secret) {
    this.#oauth = secret.oauth;
    this.#clientId = secret.clientId;
  }

  // ================================
  // ================================
  // Api call helper:
  async #api(url, query) {
    const response = await fetch(url + query, {
      headers: {
        Accept: 'application/vnd.twitchtv.v5+json',
        Authorization: 'Bearer ' + this.#oauth,
        'Client-ID': this.#clientId,
      },
    });
    return response.json();
  }

  // ================================
  // ================================
  // Get Info about given usernames:
  async profileInfo(usernames = []) {
    // Input check:
    if (usernames.length > 100) {
      return {
        status: false,
        message: 'Max 100 usernames can be specified',
      };
    } else if (usernames.length === 0) {
      return {
        status: false,
        message: 'No username specified',
      };
    }
    // Query building for API request:
    let query = usernames.map((e) => {
      return 'login=' + e;
    });
    query = query.join('&');
    // API call:
    const response = await this.#api('https://api.twitch.tv/helix/users', query ? '?' + query : '');
    // BAD RESPONSE:
    if (!response.data) {
      return {
        status: false,
        message: response.message || 'Unexpected Error',
      };
    }
    // GOOD RESPONSE:
    const ids = response.data.map((e) => {
      return e.id;
    });
    usernames = response.data.map((e) => {
      return e.login;
    });
    // if data really exists:
    if (ids.length && usernames.length) {
      return {
        status: true,
        data: { ids, usernames },
      };
    }
    // if no data exists:
    return {
      status: false,
      message: 'No Data Found',
    };
  }

  // ================================
  // ================================
  // Get user's following list by user ID:
  async followingInfo(userIDs = []) {
    // STEP 1:
    // Individual following data collector:
    const following = async (id) => {
      const dataHolder = [];
      let active = true;
      let pagination_key = '';
      // API has return limits. So we need some extras (loop):
      do {
        const response = await this.#api(
          'https://api.twitch.tv/helix/users/follows',
          '?from_id=' + id + '&first=100&after=' + pagination_key
        );
        // BAD RESPONSE:
        if (!response.data) {
          return {
            status: false,
            message: response.message || 'Unexpected Error',
          };
        }
        // GOOD RESPONSE:
        // following someone:
        if (response.data.length) {
          // extracting data:
          response.data.forEach((list) => {
            // only following info:
            dataHolder.push(list.to_login);
          });
          // if it's not last page:
          if (response.pagination.cursor) {
            pagination_key = response.pagination.cursor;
          }
          // last page:
          else {
            active = false;
          }
        }
        // following no one
        else {
          active = false;
        }
      } while (active);
      // returning result:
      if (dataHolder.length) {
        return dataHolder;
      }
      return false;
    };
    // STEP 2:
    // Main aggregate function:
    let result = [];
    // find followings for every user:
    for (const id of userIDs) {
      const data = await following(id);
      if (data) {
        // Merge results:
        result = result.concat(data);
      }
    }
    // returning result:
    if (result.length) {
      // remove duplicates:
      result = new Set(result);
      return {
        status: true,
        data: Array.from(result),
      };
    }
    return {
      status: false,
      message: 'No Data Found',
    };
  }

  // ================================
  // ================================
  // Get live channels:
  async liveInfo(channels = []) {
    const result = [];
    // split array into chunks & build query:
    const chunks = channels.reduce((all, one, i) => {
      const ch = Math.floor(i / 100);
      all[ch] = [].concat(all[ch] || [], 'user_login=' + one);
      return all;
    }, []);
    // Request chunk by chunk:
    for (const chunk of chunks) {
      const response = await this.#api('https://api.twitch.tv/helix/streams', '?' + chunk.join('&'));
      if (!response.data) {
        return {
          status: false,
          message: response.message || 'Unexpected Error',
        };
      }
      response.data.map((e) => {
        result.push(e.user_login);
      });
    }
    // returning result:
    if (result.length) {
      return {
        status: true,
        data: result,
      };
    }
    return {
      status: false,
      message: 'No Data Found',
    };
  }
}
