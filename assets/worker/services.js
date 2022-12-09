// =================================================
// Api call helper:
const _api = async (secret, url, query) => {
  const response = await fetch(url + query, {
    headers: {
      Accept: 'application/vnd.twitchtv.v5+json',
      Authorization: 'Bearer ' + secret.oauth,
      'Client-ID': secret.clientId,
    },
  });
  return await response.json();
};

// =================================================
// =================================================
// Get users' IDs & usernames that really exits.
// =================================================
export const getUsersInfo = async (secret, usernames = []) => {
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
  const response = await _api(secret, 'https://api.twitch.tv/helix/users', query ? '?' + query : '');

  if (response.data) {
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
  // if something went wrong:
  return {
    status: false,
    message: response.message || 'Unexpected Error',
  };
};

// =================================================
// =================================================
// Get user following list by user IDs.
// =================================================
export const getFollowingInfo = async (secret, userIDs = []) => {
  // Sub data collector function:
  const following = async (uid) => {
    let dataHolder = [];
    let active = true;
    let pagination_key = '';

    // API has return limit so we need to some extras (loop):
    do {
      // API call:
      const response = await _api(
        secret,
        'https://api.twitch.tv/helix/users/follows',
        '?from_id=' + uid + '&first=100&after=' + pagination_key
      );

      if (response.data) {
        if (response.data.length) {
          response.data.forEach((list) => {
            dataHolder.push(list.to_login);
          });
          if (response.pagination.cursor) {
            pagination_key = response.pagination.cursor;
          } else {
            active = false;
          }
        } else {
          // following no one
          active = false;
        }
      } else {
        return {
          status: false,
          message: response.message,
        };
      }
    } while (active);

    // Returning result:
    return {
      status: true,
      data: dataHolder,
    };
  };

  // Main aggregate function:
  let result = [];
  // find followings for every user:
  // use for of loop
  for (let index = 0; index < userIDs.length; index++) {
    const data = await following(userIDs[index]);
    if (data.status) {
      // Merge results:
      result = result.concat(data.data);
    } else {
      return {
        status: false,
        message: data.message,
      };
    }
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
};

// =================================================
// =================================================
// Get live channels info.
// =================================================
export const getLiveChannelsInfo = async (secret, channels = []) => {
  const result = [];

  // split array into chunks:
  const query = channels.reduce((all, one, i) => {
    const ch = Math.floor(i / 100);
    all[ch] = [].concat(all[ch] || [], 'user_login=' + one);
    return all;
  }, []);

  // Request by chunks:
  for (let index = 0; index < query.length; index++) {
    // API call chunk by chunk:
    const response = await _api(secret, 'https://api.twitch.tv/helix/streams', '?' + query[index].join('&'));
    if (response.data) {
      response.data.map((e) => {
        result.push(e.user_login);
      });
    } else {
      return {
        status: false,
        message: response.message,
      };
    }
  }

  // Returning result:
  return {
    status: true,
    data: result,
  };
};
