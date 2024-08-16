/*
 * Copyright Azion
 * Licensed under the MIT license. See LICENSE file for details.
 *
 * Portions of this file Copyright Yusuke Wada and Hono contributors,
 * licensed under the MIT license. See LICENSE file for details.
 *
 * Module based on hono jwt:
 * https://github.com/honojs/hono/tree/main/src/utils/jwt
 */

import { decode, sign, verify } from './jwt';

const jwt = { decode, sign, verify };

export { decode, sign, verify };

export default jwt;

export type * from './common/types';
