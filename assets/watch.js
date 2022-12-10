// --------------------------
// Tabs:
let activeTab = null;
let activeTabBtn = null;
document.getElementById('userTabs').addEventListener('click', (e) => {
  const tab = e.target;
  if (tab.tagName === 'SPAN') {
    const target = tab.getAttribute('id');
    const targetTab = document.querySelectorAll('ul[tab="' + target + '"]')[0];
    activeTab && activeTab.classList.remove('active');
    activeTabBtn && activeTabBtn.classList.remove('active');
    targetTab.classList.add('active');
    tab.classList.add('active');
    tab.classList.remove('noti');
    document.getElementById('messagesFrom').innerText = tab.innerText;
    activeTab = targetTab;
    activeTabBtn = tab;
  }
});
