// TODO: fix temp, move to runtime
const originalToString = Object.prototype.toString;

// Override Object.prototype.toString to properly identify Date objects
Object.prototype.toString = function () {
  // Check if this is a Date instance
  if (this instanceof Date || (this && typeof this.getTime === 'function' && typeof this.toISOString === 'function')) {
    return '[object Date]';
  }
  // Fall back to original toString for other objects
  return originalToString.call(this);
};

export default Object.prototype.toString;
