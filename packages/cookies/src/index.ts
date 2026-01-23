import { getCookie } from './getCookie';
import type { CookieOptions } from './setCookie';
import { setCookie } from './setCookie';

const cookies = {
  getCookie,
  setCookie,
};

export { CookieOptions, getCookie, setCookie };

export default cookies;

export * from './common/types';
