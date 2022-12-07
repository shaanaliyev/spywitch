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
