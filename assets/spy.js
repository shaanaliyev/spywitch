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
