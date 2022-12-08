import { spy } from './worker/script.js';
import { time, keepScroll } from './worker/helpers.js';

// --------------------------
// LOGGER:
const logger = (message) => {
  // the parent element of log items:
  const parent = document.getElementById('logs');
  // create log item:
  let item = document.createElement('li');
  // fill log item:
  item.innerHTML = '<span>' + time() + ' :</span> ' + message;
  // append log item to parent element:
  parent.append(item);
  // keep scroll down:
  keepScroll(parent);
};

// --------------------------
// STARTER:
const start = (e) => {
  // usernames input element:
  const usernamesElement = document.getElementById('usernames');
  // start btn:
  const theBtn = e.target;
  // if already active:
  if (theBtn.classList.contains('on')) {
    theBtn.classList.remove('on');
    theBtn.innerHTML = 'Start';
  }
  // not active:
  else {
    // if usernames empty:
    if (usernamesElement.value.length > 0) {
      // remove error:
      usernamesElement.classList.remove('error');
      // check if signed in:
      if (CID && TKN && ACC) {
        // UI/ btn:
        theBtn.classList.add('on');
        theBtn.innerHTML = 'Stop';
        // filter usernames:
        const usernames = Array.from(
          new Set(
            usernamesElement.value
              .replace(/\s+/g, '')
              .toLowerCase()
              .split(',')
              .filter((user) => user != '')
          )
        );
        // MAIN: spy function:
        spy({ clientId: CID, oauth: TKN, nick: ACC }, usernames, logger /*, dataCollector, chat */);
      }
      // have not signed in:
      else {
        // setup error:
        document.getElementById('clientId').classList.add('error');
        // redirect to setup:
        location.href = '#setup';
      }
    } else {
      // add error
      usernamesElement.classList.add('error');
    }
  }
};
document.getElementById('spyBtn').addEventListener('click', start);
