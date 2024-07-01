export const parseCookie = (cookie: string, key?: string): Record<string, string> | string | undefined => {
  const obj = cookie
    .trim()
    .split(';')
    .reduce(
      (acc, cookie) => {
        const [key, value] = cookie.split('=');
        let keyName = key;
        keyName = key.trim();
        if (keyName) {
          let cookieValue = decodeURIComponent(value).trim();
          if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
            cookieValue = cookieValue.slice(1, -1);
          }
          acc[keyName] = cookieValue;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

  if (key) {
    return obj[key.trim()];
  }
  return obj;
};
