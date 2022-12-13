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

// --------------------------
// Sleep function:
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// --------------------------
// Make messages readable.
export const messageParser = (message) => {
  let data = message?.data ?? '';
  // PING:
  if (data.startsWith('PING')) {
    // returning keepalive message to handle
    return {
      status: false,
      message: 'keepalive',
    };
  }
  // getting data
  data = data.split('PRIVMSG');
  if (data.length > 1) {
    // user:
    const msgUser = data[0].split('!')[0].substring(1);
    // channel:
    const msgChannel_a = data[1].trim();
    const msgChannel = msgChannel_a.split(' ')[0].substring(1);
    // message:
    const msgMessage = msgChannel_a.substring(msgChannel.length + 3);
    return {
      status: true,
      data: {
        user: msgUser,
        channel: msgChannel,
        message: msgMessage,
      },
    };
  }
  return {
    status: false,
  };
};
