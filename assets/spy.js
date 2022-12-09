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
// FILL DATA:
const dataFiller = (data) => {
  const indicator = document.getElementById('indicator');
  const userListElement = document.getElementById('userList');
  const channelListElement = document.getElementById('channelList');
  if (data?.users && data?.channels) {
    data.users.forEach((user) => {
      const item = document.createElement('span');
      item.innerHTML = user;
      userListElement.append(item);
    });
    data.channels.forEach((channel) => {
      const item = document.createElement('span');
      item.innerHTML = channel;
      channelListElement.append(item);
    });
    _statusTitle(0, true);
    _statusTitle(1, true);
    indicator.classList.add('active');
    indicator.innerText = 'Active';
  } else {
    userListElement.innerHTML = '';
    document.getElementById('uStatus').innerHTML = 0;
    channelListElement.innerHTML = '';
    document.getElementById('cStatus').innerHTML = 0;
    _statusTitle(0, false);
    _statusTitle(1, false);
    indicator.classList.remove('active');
    indicator.innerText = 'Not Activated';
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
    theBtn.classList.remove('on');
    theBtn.innerHTML = 'Start';
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
      dataFiller /*, chat */
    );
  }
  // auto mode:
  else {
    spy(
      'auto',
      { clientId: CID, oauth: TKN, nick: ACC },
      _filterInputs(usernamesElement.value),
      null,
      logger,
      dataFiller /*, chat */
    );
  }
};

// filter input data:
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
