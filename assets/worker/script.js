import { twServices } from './services.js';
import { sleep, messageParser } from './helpers.js';

// a global ws connection holder:
let ws = null;
// --------------------------
// SPY:
export const spy = async (mode, secret, userList, channelList, logger, dataFiller, chat) => {
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
    if (mode === 'auto') {
      if (!error && ws) {
        // #2: followingInfo
        logger('Following data...');
        const following = await twitch.followingInfo(users.data.ids);
        if (!following.status) {
          logger('<error>✕ ' + following.message + '</error>');
          error = true;
        } else if (ws) {
          logger('<success>✓</success> Channels: <b>' + following.data.length + '</b>');
          // #3: followingInfo
          logger('Live channels data...');
          const liveChannels = await twitch.liveInfo(following.data);
          if (!liveChannels.status) {
            logger('<error>✕ ' + liveChannels.message + '</error>');
            error = true;
          } else if (ws) {
            logger('<success>✓</success> Channels: <b>' + liveChannels.data.length + '</b>');
            dataToFill = { ...dataToFill, channels: liveChannels.data };
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
      // JOIN:
      logger('Joining...');
      // join list maker (chunked): [In order not to exceed the rate limit => 15 joins per 11 seconds]
      const listChunks = dataToFill.channels.reduce((all, one, i) => {
        const ch = Math.floor(i / 15);
        all[ch] = [].concat(all[ch] || [], '#' + one).join(',');
        return all;
      }, []);
      // auth & join:
      console.log(listChunks);
      ws.send('PASS oauth:' + secret.oauth);
      ws.send('NICK ' + secret.nick);
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
      // =====
      // SPY:
      if (ws) {
        logger('<success>Joined Successfully</success>');
        ws.onmessage = (message) => {
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
          }
        };
        // FILL DATA:
        document.getElementById('uStatus').innerHTML = dataToFill.users.length;
        document.getElementById('cStatus').innerHTML = dataToFill.channels.length;
        dataFiller(dataToFill);
      }
    }
  };

  if (error) {
    spyStop(logger, dataFiller);
  }
};

// --------------------------
// SPY STOP:
export const spyStop = (logger, dataFiller) => {
  if (ws) {
    ws.close();
  }
  logger('Disconnected!');
  dataFiller();
  ws = null;
};
