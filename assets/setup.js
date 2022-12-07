// ------------------------------
// Global state:
let CID;
var TKN;

// ------------------------------
// SETUP/ Connect With Twitch, ClientID:
document.getElementById('clientIdBtn').addEventListener('click', () => {
  // clientId input element:
  const clientIdElement = document.getElementById('clientId');
  // is not empty:
  if (clientIdElement.value.length > 0) {
    // remember me state:
    if (document.getElementById('rememberMe').checked) {
      // save to Local Storage:
      localStorage.setItem('CID', clientIdElement.value);
    } else {
      // keep as variable:
      CID = clientIdElement.value;
    }
    // remove red line from input element:
    clientIdElement.classList.remove('error');
    // send request to Twitch to take token:
    window.open(
      'https://id.twitch.tv/oauth2/authorize?client_id=' +
        clientIdElement.value +
        '&redirect_uri=https://shaanaliyev.com&response_type=token&scope=chat:read',
      'setup'
    );
  } else {
    // if input element is empty:
    clientIdElement?.classList.add('error');
  }
});

// ------------------------------
// SETUP/ Handle Token:
const handleToken = () => {
  // is this tab opened by JS?:
  if (window.opener) {
    // grab token from url:
    const token = window.location.hash.split('&')[0].split('=')[1];
    // is token exists:
    if (token) {
      // remember me state:
      if (window.opener.document.getElementById('rememberMe').checked) {
        // save to Local Storage:
        localStorage.setItem('TKN', token);
      } else {
        // keep as variable:
        window.opener.TKN = token;
      }
    }
    // close current chrome tab:
    window.close();
  }
  // remove onload listener:
  window.removeEventListener('load', handleToken);
};
// load handleToken function on page load:
window.addEventListener('load', handleToken);

// ------------------------------
// SPY/ Search Modes:
let activeModeDesc = document.getElementById('default-mode-desc');
let activeMode = 'auto';
document.getElementById('s-search-mode').addEventListener('click', (event) => {
  const radioElement = event.target;
  if (radioElement.tagName === 'INPUT') {
    const targetModeSelector = radioElement.getAttribute('id');
    const targetModeDesc = document.querySelectorAll('small[mode="' + targetModeSelector + '"]')[0];
    if (targetModeDesc) {
      activeModeDesc && activeModeDesc.classList.remove('active');
      targetModeDesc.classList.add('active');
      activeModeDesc = targetModeDesc;
      activeMode = targetModeSelector;
    }
    // syp textareas:
    const spyElementsCollection = document.getElementById('s-spy').children;
    if (targetModeSelector === 'manual') {
      spyElementsCollection[2].classList.add('active');
      spyElementsCollection[3].classList.add('active');
    } else {
      spyElementsCollection[2].classList.remove('active');
      spyElementsCollection[3].classList.remove('active');
    }
  }
});
