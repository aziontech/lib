const envDebugFlag = process.env.AZION_DEBUG && process.env.AZION_DEBUG === 'true';
export const resolveToken = (token?: string) => token ?? process.env.AZION_TOKEN ?? '';
export const resolveDebug = (debug?: boolean) => debug ?? !!envDebugFlag;
