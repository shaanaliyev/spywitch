import { getUsersInfo, getFollowingInfo, getLiveChannelsInfo } from './services.js';
import { messageParser } from './helpers.js';

// a global ws connection holder:
let ws = null;
// --------------------------
// SPY:
export const spy = (mode, secret, userList, channelList, logger, dataFiller, chat) => {
  // data to fill by using dataFiller:
  let dataToFill = {};
  // error detector:
  let error = false;
  // creating ws connection:
  ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443'); // address for localhost: ws://irc-ws.chat.twitch.tv:80
  // WS:
  ws.onopen = async () => {
    logger('<success>Connected!</success>');
    // make an array from userList:
    const usersArr = Array.from(userList);

    // ==============
    // GETTING INFO
    // ==============
    // ~~~SERVICE: getUsersInfo:
    logger('User data...');
    const users = await getUsersInfo(secret, usersArr);
    if (!users.status) {
      logger('<error>✕ ' + users.message + '</error>');
      error = true;
    } else if (ws) {
      // getUsersInfo report:
      logger('<success>✓</success> Users: <b>' + users.data.ids.length + '</b>');
      // Save data:
      dataToFill = { ...dataToFill, users: users.data.usernames };
      // +++getUsersInfo;

      // ===========
      // AUTO MODE:
      if (mode === 'auto') {
        // ~~~SERVICE: getFollowingInfo:
        logger('Following data...');
        const following = await getFollowingInfo(secret, users.data.ids);
        if (!following.status) {
          logger('<error>✕ ' + following.message + '</error>');
          error = true;
        } else if (ws) {
          logger('<success>✓</success> Channels: <b>' + following.data.length + '</b>');
          // +++getFollowingInfo;

          // ~~~SERVICE: getLiveChannelsInfo:
          logger('Live channels data...');
          const liveChannels = await getLiveChannelsInfo(secret, following.data);
          if (!liveChannels.status) {
            logger('<error>✕ ' + liveChannels.message + '</error>');
            error = true;
          } else if (ws) {
            logger('<success>✓</success> Channels: <b>' + liveChannels.data.length + '</b>');
            dataToFill = { ...dataToFill, channels: liveChannels.data };
            // +++getLiveChannelsInfo;

            // ==============
            // JOINING
            // ==============
            logger('Joining...');
            // join list maker:
            let list = liveChannels.data.map((e) => '#' + e);
            list = list.join(',');
            // auth & join:
            ws.send('PASS oauth:' + secret.oauth);
            ws.send('NICK ' + secret.nick);
            ws.send('JOIN ' + list);
            logger('<success>Joined Successfully</success>');

            // ==============
            // SPYING
            // ==============
            // reading messages:
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
      }
      // ===========
      // MANUAL MODE (same process but this time the channels selected manually)
      else if (mode === 'manual') {
        logger('Channel data...');
        const channelsArr = Array.from(channelList);
        const channels = await getUsersInfo(secret, channelsArr);
        if (!channels.status) {
          logger('<error>✕ ' + channels.message + '</error>');
          error = true;
        } else if (ws) {
          logger('<success>✓</success> Users: <b>' + channels.data.ids.length + '</b>');
          dataToFill = { ...dataToFill, channels: channels.data.usernames };
          logger('Joining...');
          let list = channels.data.usernames.map((e) => '#' + e);
          list = list.join(',');
          ws.send('PASS oauth:' + secret.oauth);
          ws.send('NICK ' + secret.nick);
          ws.send('JOIN ' + list);
          logger('<success>Joined Successfully</success>');
          // SPYING
          ws.onmessage = (message) => {
            const response = messageParser(message);
            if (response.status) {
              if (userList.has(response.data?.user)) {
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
    }
    if (error) {
      spyStop(logger, dataFiller);
    }
  };
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
