import { spy, spyStop } from './worker/script.js';
import { time, keepScroll } from './worker/helpers.js';

// --------------------------
// LOGGER:
const logger = (message) => {
  // the parent element of log items:
  const parent = document.getElementById('logs');
  // create log item:
  const item = document.createElement('li');
  // fill log item:
  item.innerHTML = '<span>' + time() + ' :</span> ' + message;
  // append log item to parent element:
  parent.append(item);
  // keep scroll down:
  keepScroll(parent);
};

// --------------------------
// CHAT:
const chat = ({ user, channel, message }) => {
  // New message indicator:
  const tabBtn = document.getElementById('u_' + user);
  if (!tabBtn.classList.contains('active')) {
    tabBtn.classList.add('noti');
  }
  // Append message:
  const targetTab = document.querySelectorAll('ul[tab="u_' + user + '"]')[0];
  const element = document.createElement('li');
  element.innerHTML = '<span>' + time() + ' </span><span>' + channel + ' </span><span>> </span>' + message;
  targetTab.append(element);
  keepScroll(targetTab);
};

// --------------------------
// FILL DATA:
const dataFiller = (data) => {
  const indicator = document.getElementById('indicator');
  const userListElement = document.getElementById('userList');
  const channelListElement = document.getElementById('channelList');
  // ON:
  if (data?.users && data?.channels) {
    // users:
    data.users.forEach((user) => {
      // SPY/ status:
      const item = document.createElement('span');
      item.innerHTML = user;
      userListElement.append(item);
      // WATCH/ tabs:
      const userTabs = document.createElement('span');
      userTabs.setAttribute('id', 'u_' + user);
      userTabs.innerText = user;
      document.getElementById('userTabs').append(userTabs);
      //  Watch/ messages
      const messagesTab = document.createElement('ul');
      messagesTab.setAttribute('tab', 'u_' + user);
      document.getElementById('messageTabs').append(messagesTab);
    });
    // channels:
    data.channels.forEach((channel) => {
      // SPY/ status:
      const item = document.createElement('span');
      item.innerHTML = channel;
      channelListElement.append(item);
    });
    // SPY/ status:
    _statusTitle(0, true);
    _statusTitle(1, true);
    // indicator:
    indicator.classList.add('active');
    indicator.innerText = 'Active';
  }
  // OFF:
  else {
    // SPY/ status:
    userListElement.innerHTML = '';
    channelListElement.innerHTML = '';
    _statusTitle(0, false);
    _statusTitle(1, false);
    // indicator:
    indicator.classList.remove('active');
    indicator.innerText = 'Not Activated';
    document.getElementById('uStatus').innerHTML = 0;
    document.getElementById('cStatus').innerHTML = 0;
    // WATCH/ userTabs:
    document.getElementById('userTabs').innerHTML = '';
    // WATCH/ messageTabs:
    document.getElementById('messageTabs').innerHTML = '';
    document.getElementById('messagesFrom').innerText = '';
    // UI - btn:
    const theBtn = document.getElementById('spyBtn');
    theBtn.classList.remove('on');
    theBtn.innerHTML = 'Start';
  }
};
// UI/ show-hide status titles (idk why I split this as a separate function xd):
const _statusTitle = (idx, state) => {
  const statusTitleCollection = document.getElementsByClassName('statusTitle');
  if (state) {
    statusTitleCollection[idx].classList.add('active');
  } else {
    statusTitleCollection[idx].classList.remove('active');
  }
};

// --------------------------
// STARTER:
const start = (e) => {
  // start btn:
  const theBtn = e.target;

  // CHECK 1/ if already active:
  if (theBtn.classList.contains('on')) {
    spyStop(logger, dataFiller);
    return;
  }

  // CHECK 2/ have not signed in:
  if (!CID || !TKN || !ACC) {
    // setup error:
    document.getElementById('clientId').classList.add('error');
    // redirect to setup:
    location.href = '#setup';
    return;
  }

  // usernames input element:
  const usernamesElement = document.getElementById('usernames');
  // channels input element:
  const channelsElement = document.getElementById('channels');

  // CHECK 3/ empty inputs:
  // spy mode is manual?:
  const mode = document.getElementById('manual').checked;
  // manual mode:
  if (mode) {
    // usernames empty:
    if (usernamesElement.value.length < 1) {
      // add error
      usernamesElement.classList.add('error');
    } else {
      usernamesElement.classList.remove('error');
    }
    // channels empty:
    if (channelsElement.value.length < 1) {
      // add error
      channelsElement.classList.add('error');
    } else {
      channelsElement.classList.remove('error');
    }
    // one of or both of them are empty:
    if (usernamesElement.value.length < 1 || channelsElement.value.length < 1) {
      return;
    } else {
      theBtn.classList.add('on');
      theBtn.innerHTML = 'Stop';
    }
  }
  // auto mode:
  else {
    if (usernamesElement.value.length < 1) {
      // add error
      usernamesElement.classList.add('error');
      return;
    } else {
      usernamesElement.classList.remove('error');
      theBtn.classList.add('on');
      theBtn.innerHTML = 'Stop';
    }
  }

  // FINAL:
  // manual mode:
  if (mode) {
    spy(
      'manual',
      { clientId: CID, oauth: TKN, nick: ACC },
      _filterInputs(usernamesElement.value),
      _filterInputs(channelsElement.value),
      logger,
      dataFiller,
      chat
    );
  }
  // auto mode:
  else {
    spy('auto', { clientId: CID, oauth: TKN, nick: ACC }, _filterInputs(usernamesElement.value), null, logger, dataFiller, chat);
  }
};

// filter input data: (remove extra spaces, empty elements, duplicates)
const _filterInputs = (data) => {
  return new Set(
    data
      .replace(/\s+/g, '')
      .toLowerCase()
      .split(',')
      .filter((user) => user != '')
  );
};

document.getElementById('spyBtn').addEventListener('click', start);
