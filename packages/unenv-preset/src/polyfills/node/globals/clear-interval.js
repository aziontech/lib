const _clearInterval = globalThis.clearInterval;

globalThis.clearInterval = (interval) => {
  let idToClear = interval;
  if (interval && typeof interval === 'object') {
    if ('id' in interval) {
      idToClear = interval.id;
    } else if ('_id' in interval) {
      idToClear = interval._id;
    }
  }
  if (typeof idToClear === 'number' && Number.isFinite(idToClear)) {
    _clearInterval(idToClear);
  } else if (interval && typeof interval.close === 'function') {
    interval.close();
  }
};

export default globalThis.clearInterval;
