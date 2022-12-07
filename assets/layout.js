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
      document.getElementById(reqPage.substring(1)).classList.add('active');
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
      activeHash && document.getElementById(activeHash.substring(1)).classList.remove('active');
      pageElement.classList.add('active');
      document.getElementById(reqPage.substring(1)).classList.add('active');
      activePageElement = pageElement;
      activeHash = reqPage;
      break;
    }
  }
});

// ------------------------------
// Change active page dynamically on hashchange:
// document.getElementById('navbar').addEventListener('click', (event) => {
//   const navElement = event.target;
//   if (navElement.hasAttribute('href')) {
//     const targetSelector = navElement.getAttribute('href');
//     const targetPage = document.querySelectorAll('div[page="' + targetSelector + '"]')[0];
//     if (targetPage) {
//       activePageElement && activePageElement.classList.remove('active');
//       targetPage.classList.add('active');
//       activePageElement = targetPage;
//     }
//   }
// });
