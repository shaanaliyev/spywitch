import { getUsersInfo, getFollowingInfo, getLiveChannelsInfo } from './services.js';
import { messageParser } from './helpers.js';

// a global ws connection holder:
let ws = null;
// --------------------------
// SPY:
export const spy = (mode, secret, userList, channelList, logger, dataFiller) => {
  // data to fill by using dataFiller:
  let dataToFill = {};
  // creating ws connection:
  ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
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
    } else if (ws) {
      // getUsersInfo report:
      logger('<success>✓</success> Users: <b>' + users.data.ids.length + '</b>');
      // Save data:
      dataToFill = { ...dataToFill, users: users.data.usernames };
      // +++getUsersInfo;

      // ~~~SERVICE: getFollowingInfo:
      logger('Following data...');
      const following = await getFollowingInfo(secret, users.data.ids);
      if (!following.status) {
        logger('<error>✕ ' + following.message + '</error>');
      } else if (ws) {
        logger('<success>✓</success> Channels: <b>' + following.data.length + '</b>');
        // +++getFollowingInfo;

        // ~~~SERVICE: getLiveChannelsInfo:
        logger('Live channels data...');
        const liveChannels = await getLiveChannelsInfo(secret, following.data);
        if (!liveChannels.status) {
          logger('<error>✕ ' + liveChannels.message + '</error>');
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
            // Chat message logic here:
            if (response.status) {
              // Only specific users:
              if (userList.has(response.data?.user)) {
                // console.log(response.data);
                // chat(response.data); // <---------------- !!!!!
                console.log(response.data);
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
