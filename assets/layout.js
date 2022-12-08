// ------------------------------
// Global state:
let activePageElement = null;
let activeHash = null;
let pages = new Set(['#setup', '#spy', '#watch', '#about']);

// ------------------------------
// Boot page onload:
const bootPage = () => {
  const pageCollection = document.getElementsByClassName('page');
  const hash = location.hash;
  for (const pageElement of pageCollection) {
    // check page exists:
    const reqPage = pages.has(hash) ? hash : '#setup';
    if (pageElement.getAttribute('page') === reqPage) {
      pageElement.classList.add('active');
      document.getElementById(reqPage).classList.add('active');
      activePageElement = pageElement;
      activeHash = reqPage;
      break;
    }
  }
  window.removeEventListener('load', bootPage);
};
window.addEventListener('load', bootPage);

// ------------------------------
// Change page on hashchange:
window.addEventListener('hashchange', () => {
  const pageCollection = document.getElementsByClassName('page');
  const hash = location.hash;
  for (const pageElement of pageCollection) {
    const reqPage = pages.has(hash) ? hash : '#setup';
    if (pageElement.getAttribute('page') === reqPage) {
      activePageElement && activePageElement.classList.remove('active');
      activeHash && document.getElementById(activeHash).classList.remove('active');
      pageElement.classList.add('active');
      document.getElementById(reqPage).classList.add('active');
      activePageElement = pageElement;
      activeHash = reqPage;
      break;
    }
  }
});

// ------------------------------
// SPY/ Search Modes:
document.getElementById('a-search-mode').addEventListener('click', (event) => {
  const modeElement = event.target;
  if (modeElement.tagName === 'INPUT') {
    const mode = modeElement.getAttribute('id');
    const autoDescElement = document.getElementById('autoDesc');
    const manualDescElement = document.getElementById('manualDesc');
    const channelsLElement = document.getElementById('channelsL');
    const channelsElement = document.getElementById('channels');
    if (mode === 'auto') {
      manualDescElement.classList.remove('active');
      channelsLElement.classList.remove('active');
      channelsElement.classList.remove('active');
      autoDescElement.classList.add('active');
    } else {
      autoDescElement.classList.remove('active');
      manualDescElement.classList.add('active');
      channelsLElement.classList.add('active');
      channelsElement.classList.add('active');
    }
  }
});
