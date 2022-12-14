import { twServices } from './services.js';
import { sleep, messageParser } from './helpers.js';

// a global ws connection holder:
let ws = null;
// --------------------------
// SPY:
export const spy = async (mode, secret, userList, channelList, logger, statusFiller, dataFiller, chat) => {
  // Twitch Services:
  const twitch = new twServices(secret);
  // data to fill by using dataFiller:
  let dataToFill = {};
  // error detector:
  let error = false;
  // creating ws connection:
  ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443'); // address for localhost: ws://irc-ws.chat.twitch.tv:80
  // WS:
  ws.onopen = async () => {
    // #0: first time connection:
    logger('<success>Connected!</success>');
    // #1: user profileInfo:
    logger('User data...');
    const users = await twitch.profileInfo(Array.from(userList));
    if (!users.status) {
      logger('<error>✕ ' + users.message + '</error>');
      error = true;
    } else if (ws) {
      logger('<success>✓</success> Users: <b>' + users.data.ids.length + '</b>');
      dataToFill = { ...dataToFill, users: users.data.usernames };
    }

    // AUTO MODE:
    let followingChannels = null;
    let cList = null;
    if (mode === 'auto') {
      if (!error && ws) {
        // #2: followingInfo
        logger('Following data...');
        followingChannels = await twitch.followingInfo(users.data.ids);
        if (!followingChannels.status) {
          logger('<error>✕ ' + followingChannels.message + '</error>');
          error = true;
        } else if (ws) {
          logger('<success>✓</success> Channels: <b>' + followingChannels.data.length + '</b>');
          // #3: followingInfo
          logger('Live channels data...');
          cList = await twitch.liveInfo(followingChannels.data);
          if (!cList.status) {
            logger('<error>✕ ' + cList.message + '</error>');
            error = true;
          } else if (ws) {
            logger('<success>✓</success> Channels: <b>' + cList.data.length + '</b>');
            dataToFill = { ...dataToFill, channels: cList.data };
          }
        }
      }
    }
    // MANUAL MODE:
    else if (mode === 'manual') {
      if (!error) {
        // #2: channel profileInfo
        logger('Channels data...');
        const channels = await twitch.profileInfo(Array.from(channelList));
        if (!channels.status) {
          logger('<error>✕ ' + channels.message + '</error>');
          error = true;
        } else if (ws) {
          logger('<success>✓</success> Channels: <b>' + channels.data.ids.length + '</b>');
          dataToFill = { ...dataToFill, channels: channels.data.usernames };
        }
      }
    }

    // JOIN & SPY:
    if (!error && ws) {
      // =====
      // AUTH:
      ws.send('PASS oauth:' + secret.oauth);
      ws.send('NICK ' + secret.nick);
      // JOIN:
      logger('Joining...');
      await _join(ws, dataToFill.channels, logger);
      // =====
      // SPY:
      if (ws) {
        ws.onmessage = async (message) => {
          const response = messageParser(message);
          // if has messages
          if (response.status) {
            // filter for specific users:
            if (userList.has(response.data?.user)) {
              // send messages to chat method to handle:
              chat(response.data);
            }
          } else if (response.message === 'keepalive') {
            ws.send('PONG');
            // =====
            // update live channels list:
            if (followingChannels) {
              // check all channels for live status:
              const newCList = await twitch.liveInfo(followingChannels.data);
              if (newCList.status && ws) {
                // find the difference between last live channels and new live channels:
                const seen = new Set(cList.data);
                let difference = [];
                for (const c of newCList.data) {
                  if (!seen.has(c)) {
                    difference.push(c);
                  }
                }
                if (difference.length) {
                  // join to the new found channels:
                  await _join(ws, difference, logger);
                  // update the live channels list:
                  cList.data = cList.data.concat(difference);
                  // update dataToFill:
                  dataToFill = { ...dataToFill, channels: cList.data };
                  // change indicator channels count:
                  document.getElementById('cStatus').innerHTML = dataToFill.channels.length;
                  // fill data:
                  statusFiller(dataToFill);
                }
              }
            }
          }
        };
        // FILL DATA:
        document.getElementById('uStatus').innerHTML = dataToFill.users.length;
        document.getElementById('cStatus').innerHTML = dataToFill.channels.length;
        statusFiller(dataToFill);
        dataFiller(dataToFill);
      }
    }
    if (error) {
      spyStop(logger, statusFiller, dataFiller);
    }
  };
};

// Join channels:
const _join = async (ws, channels, logger) => {
  // join list maker (chunked): [In order not to exceed the rate limit => 15 joins per 11 seconds]
  const listChunks = channels.reduce((all, one, i) => {
    const ch = Math.floor(i / 15);
    all[ch] = [].concat(all[ch] || [], '#' + one).join(',');
    return all;
  }, []);
  for (const chunk of listChunks) {
    if (!ws) break;
    // join
    ws.send('JOIN ' + chunk);
    // show joined channels:
    logger(
      chunk
        .substring(1)
        .split(',#')
        .map((channel) => {
          return '<channel>' + channel + '</channel>';
        })
        .join(', ')
    );
    if (listChunks.length > 1) {
      await sleep(11000);
    }
  }
};

// --------------------------
// SPY STOP:
export const spyStop = (logger, statusFiller, dataFiller) => {
  if (ws) {
    ws.close();
  }
  logger('Disconnected!');
  statusFiller();
  dataFiller();
  ws = null;
};
