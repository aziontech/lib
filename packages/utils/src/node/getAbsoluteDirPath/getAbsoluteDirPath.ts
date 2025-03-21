const isWindows = process.platform === 'win32';

function getAbsoluteDirPath(currentModuleFullPath: string = import.meta.url, path: string = 'bundler'): string {
  const regex = new RegExp(`(.*${path})(.*)`);
  const matchResult = currentModuleFullPath.match(regex);
  let baselibPath = matchResult ? matchResult[1] : '';

  // Handle npx case where the package name is "edge-functions"
  if (currentModuleFullPath.includes('edge-functions') && path === 'bundler') {
    const edgeFunctionsRegex = new RegExp(`(.*edge-functions)(.*)`);
    const edgeFunctionsMatch = currentModuleFullPath.match(edgeFunctionsRegex);
    baselibPath = edgeFunctionsMatch ? edgeFunctionsMatch[1] : baselibPath;
  }

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

export default getAbsoluteDirPath;
