// ------------------------------
// Global state:
let CID;
let ACC;
var TKN = localStorage.getItem('TKN');

// ------------------------------
// SETUP/ Connect With Twitch, ClientID:
document.getElementById('clientIdBtn').addEventListener('click', () => {
  // clientId input element:
  const clientIdElement = document.getElementById('clientId');
  // is not empty:
  if (clientIdElement.value.length > 0) {
    // remove red line from input element:
    clientIdElement.classList.remove('error');
    // send request to Twitch to take token:
    window.open(
      'https://id.twitch.tv/oauth2/authorize?client_id=' +
        clientIdElement.value +
        '&redirect_uri=https://shaanaliyev.github.io/spywitch&response_type=token&scope=chat:read',
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
      }
      // save in variable (we need it in the variable because we always use it from there):
      window.opener.TKN = token;
      // run checkSession to update UI and and get clientID:
      window.opener.checkSession();
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
// SETUP/ Session. Get ClientID:
var checkSession = async () => {
  // If token exists:
  if (TKN) {
    // send request to check token:
    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: 'OAuth ' + TKN,
      },
    });
    const data = await response?.json();
    // if token is valid:
    if (data.client_id) {
      // save CID in variable:
      CID = data.client_id;
      ACC = data.login;
      // UI/ set account name:
      document.getElementById('profile').innerText = data.login;
      // UI/ hide setup form:
      document.getElementById('a-setup').classList.remove('active');
      // UI/ show account info panel:
      document.getElementById('a-account').classList.add('active');
    } else {
      // Clear Saved Data:
      localStorage.clear();
      CID = undefined;
      ACC = undefined;
      TKN = undefined;
      // reload page:
      location.reload();
    }
  }
  // remove onload listener:
  window.removeEventListener('load', checkSession);
};
// load handleToken function on page load:
window.addEventListener('load', checkSession);

// ------------------------------
// SETUP/ Revoke Access:
document.getElementById('revoke').addEventListener('click', () => {
  // Clear Saved Data:
  localStorage.clear();
  CID = undefined;
  ACC = undefined;
  TKN = undefined;
  // required Setup Page elements:
  const s_setup = document.getElementById('a-setup');
  const s_account = document.getElementById('a-account');
  const profile = document.getElementById('profile');
  // UI/ remove account name:
  profile.innerText = '';
  // UI/ remove account info panel:
  s_account.classList.remove('active');
  // UI/ show setup form:
  s_setup.classList.add('active');
  // reload page :
  location.reload();
});
