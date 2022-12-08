// --------------------------
// SPY:
export const spy = (secret, userList = [], logger) => {
  logger(userList[0]);
  // console.log(secret, userList);
};
