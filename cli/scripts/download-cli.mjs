import { execSync } from 'child_process';
import fs from 'fs';
import https from 'https';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const defaultVersion = '1.37.0';
const version = process.env.AZION_CLI_VERSION || defaultVersion;

const baseUrl = `https://github.com/aziontech/azion/releases/download/${version}`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let packageRoot = __dirname;
while (!fs.existsSync(path.join(packageRoot, 'package.json'))) {
  const parentDir = path.dirname(packageRoot);
  if (parentDir === packageRoot) {
    throw new Error('Could not find the root directory of the library');
  }
  packageRoot = parentDir;
}

const binDir = path.join(packageRoot, 'bin');

function isGlobalInstall() {
  const npmRoot = path.resolve(process.execPath, '..', '..');
  const npmGlobalPrefix = path.resolve(npmRoot, 'lib', 'node_modules');
  const packagePath = path.resolve(__dirname, '..', '..');

  return packagePath.startsWith(npmGlobalPrefix);
}

function getPlatform() {
  const platform = os.platform();
  const arch = os.arch();

  if (platform === 'darwin') {
    return { os: 'darwin', arch: arch === 'x64' ? 'amd64' : 'arm64', ext: 'tar.gz' };
  } else if (platform === 'linux') {
    return { os: 'linux', arch: arch === 'x64' ? 'amd64' : 'arm64', ext: 'tar.gz' };
  } else if (platform === 'win32') {
    return { os: 'windows', arch: 'amd64', ext: 'zip' };
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode === 302) {
          return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        }
        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}

async function downloadAndExtract(platform) {
  const fileName = `azion_${version}_${platform.os}_${platform.arch}.${platform.ext}`;
  const url = `${baseUrl}/${fileName}`;
  const filePath = path.join(binDir, fileName);

  try {
    await downloadFile(url, filePath);

    if (platform.ext === 'tar.gz') {
      execSync(`tar -xzvf "${filePath}" -C "${binDir}"`, { stdio: 'inherit' });
    } else if (platform.ext === 'zip') {
      execSync(`unzip -o "${filePath}" -d "${binDir}"`, { stdio: 'inherit' });
    }

    fs.unlinkSync(filePath);

    const files = fs.readdirSync(binDir);
    const extractedBinary = files.find((file) => file.startsWith('azion'));

    if (!extractedBinary) {
      throw new Error('Extracted binary not found');
    }

    const extractedPath = path.join(binDir, extractedBinary);
    const finalName = platform.os === 'windows' ? 'azion.exe' : 'azion';
    const finalPath = path.join(binDir, finalName);

    fs.renameSync(extractedPath, finalPath);

    if (platform.os !== 'windows') {
      fs.chmodSync(finalPath, '755');
    }
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
}

function checkExistingCliVersion() {
  try {
    const output = execSync('azion -v', { stdio: 'pipe' }).toString().trim();
    const versionMatch = output.match(/v(\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : null;
  } catch (error) {
    return null;
  }
}

async function main() {
  try {
    if (!isGlobalInstall()) {
      return;
    }

    const existingVersion = checkExistingCliVersion();
    if (existingVersion && existingVersion === version) {
      return;
    }

    const platform = getPlatform();
    // const finalName = platform.os === 'windows' ? 'azion.exe' : 'azion';
    // const finalPath = path.join(binDir, finalName);

    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true, mode: 0o755 });
    }

    await downloadAndExtract(platform);
  } catch (error) {
    console.error(`Error during installation: ${error.message}`);
    process.exit(1);
  }
}

main();
