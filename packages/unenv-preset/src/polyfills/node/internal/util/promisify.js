/* eslint-disable */
const customSymbol = Symbol.for('nodejs.util.promisify.custom');

function _promisify(fn) {
  if (fn[customSymbol]) {
    return fn[customSymbol];
  }
  return function (...args) {
    return new Promise((resolve, reject) => {
      try {
        fn.call(this, ...args, (err, val) => {
          if (err) {
            return reject(err);
          }
          resolve(val);
        });
      } catch (error) {
        console.error('Error in promisified function:', error.stack);
        reject(error);
      }
    });
  };
}

export const promisify = Object.assign(_promisify, { custom: customSymbol });
