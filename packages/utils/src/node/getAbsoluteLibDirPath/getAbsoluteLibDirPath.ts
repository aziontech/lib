const isWindows = process.platform === 'win32';

function getAbsoluteLibDirPath() {
  const currentModuleFullPath = import.meta.url;
  const matchResult = currentModuleFullPath.match(/(.*bundler)(.*)/);
  let baselibPath = matchResult ? matchResult[1] : '';
  if (isWindows) {
    baselibPath = new URL(baselibPath).pathname;
    if (baselibPath.startsWith('/')) {
      baselibPath = baselibPath.slice(1);
    }
  }
  if (!isWindows) {
    baselibPath = baselibPath.replace('file://', '');
  }

  return baselibPath;
}

export default getAbsoluteLibDirPath;
