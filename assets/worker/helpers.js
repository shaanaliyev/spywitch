// --------------------------
// Get current time:
export const time = () => {
  const time = new Date();
  return (
    (time.getHours() < 10 ? '0' : '') +
    time.getHours() +
    ':' +
    (time.getMinutes() < 10 ? '0' : '') +
    time.getMinutes() +
    ':' +
    (time.getSeconds() < 10 ? '0' : '') +
    time.getSeconds()
  );
};

// --------------------------
// Keep scrolled down:
export const keepScroll = (iParent) => {
  const isScrolledToBottom = iParent.scrollHeight - iParent.clientHeight <= iParent.scrollTop + 100;
  if (isScrolledToBottom) {
    iParent.scrollTop = iParent.scrollHeight - iParent.clientHeight;
  }
};
