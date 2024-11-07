import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import https from 'https';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const defaultVersion = '2.2.0';
const version = process.env.AZION_CLI_VERSION || defaultVersion;

const baseUrl = `https://github.com/aziontech/azion/releases/download/${version}`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Navigate up the directory tree to find the root directory of the installed library
let packageRoot = __dirname;
while (!fs.existsSync(path.join(packageRoot, 'package.json'))) {
  const parentDir = path.dirname(packageRoot);
  if (parentDir === packageRoot) {
    throw new Error('Could not find the root directory of the library');
  }
  packageRoot = parentDir;
}

const binDir = path.join(packageRoot, 'bin');

const log = {
  info: (msg) => console.log(chalk.blue('ℹ ') + msg),
  success: (msg) => console.log(chalk.green('✔ ') + msg),
  warning: (msg) => console.log(chalk.yellow('⚠ ') + msg),
  error: (msg) => console.error(chalk.red('✖ ') + msg),
  highlight: (msg) => console.log(chalk.hex('#FFA500')('🚀 ' + msg)),
  url: (msg) => chalk.hex('#0000AA')(msg),
};

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
    log.info(`Downloading from ${chalk.blackBright(url)}`);
    https
      .get(url, (response) => {
        if (response.statusCode === 302) {
          // Handle redirect
          return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        }

        const file = fs.createWriteStream(dest);
        response.pipe(file);

        file.on('finish', () => {
          file.close();
          const fileSize = fs.statSync(dest).size;
          log.success(`File downloaded: ${chalk.cyan(dest)}`);
          log.info(`File size: ${chalk.yellow(fileSize)} bytes`);
          if (fileSize === 0) {
            reject(new Error('The downloaded file is empty'));
          } else {
            resolve();
          }
        });
      })
      .on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}

function listDirectoryContents(dir) {
  const files = fs.readdirSync(dir);
  log.info(`Directory contents ${chalk.cyan(dir)}:`);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    console.log(
      `  ${chalk.cyan(file)} (${stats.isDirectory() ? 'directory' : 'file'}, ${chalk.yellow(stats.size)} bytes)`,
    );
  });
}

async function downloadAndExtract(platform) {
  const fileName = `azion_${version}_${platform.os}_${platform.arch}.${platform.ext}`;
  const url = `${baseUrl}/${fileName}`;
  const filePath = path.join(binDir, fileName);

  try {
    await downloadFile(url, filePath);

    log.info(`Extracting ${chalk.cyan(fileName)}...`);
    log.info(`File path: ${chalk.cyan(filePath)}`);
    log.info(`Destination directory: ${chalk.cyan(binDir)}`);

    try {
      if (platform.ext === 'tar.gz') {
        log.info('Executing tar command...');
        execSync(`tar -xzvf "${filePath}" -C "${binDir}"`, { stdio: 'inherit' });
      } else if (platform.ext === 'zip') {
        log.info('Executing unzip command...');
        execSync(`unzip -o "${filePath}" -d "${binDir}"`, { stdio: 'inherit' });
      }
    } catch (error) {
      log.error(`Error extracting file: ${error.message}`);
      log.info('File contents:');
      execSync(`file "${filePath}"`, { stdio: 'inherit' });
      throw error;
    }

    log.success('Extraction completed. Verifying directory contents:');
    listDirectoryContents(binDir);

    fs.unlinkSync(filePath);
    log.info(`Compressed file removed: ${chalk.cyan(filePath)}`);

    // Find the extracted binary
    const files = fs.readdirSync(binDir);
    const extractedBinary = files.find((file) => file.startsWith('azion'));

    if (!extractedBinary) {
      log.error('Extracted binary not found. Directory contents:');
      listDirectoryContents(binDir);
      throw new Error('Extracted binary not found');
    }

    const extractedPath = path.join(binDir, extractedBinary);
    const finalName = platform.os === 'windows' ? 'azion.exe' : 'azion';
    const finalPath = path.join(binDir, finalName);

    // Rename the extracted binary
    fs.renameSync(extractedPath, finalPath);
    log.success(`Binary renamed from ${chalk.cyan(extractedPath)} to ${chalk.cyan(finalPath)}`);

    // Set execution permissions on Unix
    if (platform.os !== 'windows') {
      fs.chmodSync(finalPath, '755');
      log.success(`Execution permissions set for ${chalk.cyan(finalPath)}`);
    }

    log.success(`Azion CLI installed at: ${chalk.cyan(finalPath)}`);
  } catch (error) {
    log.error(`Error during download or extraction: ${error.message}`);
    if (fs.existsSync(filePath)) {
      log.info(`Removing corrupted file: ${chalk.cyan(filePath)}`);
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

async function getLatestVersion() {
  return new Promise((resolve, reject) => {
    log.info('Fetching latest version from GitHub API...');

    const options = {
      hostname: 'api.github.com',
      path: '/repos/aziontech/azion/releases/latest',
      headers: {
        'User-Agent': 'Azion-CLI-Installer',
      },
    };

    https
      .get(options, (response) => {
        let data = '';
        response.on('data', (chunk) => (data += chunk));
        response.on('end', () => {
          try {
            const release = JSON.parse(data);
            const version = release.tag_name.replace(/^v/, '');

            if (/^\d+\.\d+\.\d+$/.test(version)) {
              log.success(`Latest version found from API: ${version}`);
              resolve(version);
            } else {
              log.warning(`Invalid version format from API: ${version}`);
              log.info(`Using default version: ${defaultVersion}`);
              resolve(defaultVersion);
            }
          } catch (err) {
            log.warning(`Error processing API response: ${err.message}`);
            log.info(`Using default version: ${defaultVersion}`);
            resolve(defaultVersion);
          }
        });
      })
      .on('error', (err) => {
        log.warning(`Could not fetch latest version: ${err.message}`);
        log.info(`Using default version: ${defaultVersion}`);
        resolve(defaultVersion);
      });
  });
}

async function main() {
  try {
    let selectedVersion;

    if (process.env.AZION_CLI_VERSION) {
      selectedVersion = process.env.AZION_CLI_VERSION;
      log.info(`Using version from environment variable: ${selectedVersion}`);
    } else {
      selectedVersion = await getLatestVersion();
      log.info(`Using latest version: ${selectedVersion}`);
    }

    // Manter a URL base original
    const baseUrl = `https://github.com/aziontech/azion/releases/download/v${selectedVersion}`;

    log.highlight(`Checking Azion CLI v${selectedVersion}`);
    console.log();

    const existingVersion = checkExistingCliVersion();
    if (existingVersion) {
      log.info(`Azion CLI is already installed (version ${existingVersion})`);
      if (existingVersion === selectedVersion) {
        log.success(`Azion CLI v${selectedVersion} is already installed and up to date.`);
        process.exit(0);
      } else {
        log.info(
          `Current version (${existingVersion}) differs from desired (${selectedVersion}). Proceeding with update...`,
        );
      }
    }

    const platform = getPlatform();
    const finalName = platform.os === 'windows' ? 'azion.exe' : 'azion';
    const finalPath = path.join(binDir, finalName);

    if (fs.existsSync(finalPath)) {
      log.info(`Azion CLI binary found at: ${chalk.cyan(finalPath)}`);

      // Check current binary version
      try {
        const currentVersion = execSync(`"${finalPath}" -v`).toString().trim();
        const versionMatch = currentVersion.match(/v(\d+\.\d+\.\d+)/);
        if (versionMatch && versionMatch[1] === selectedVersion) {
          log.success(`Azion CLI v${selectedVersion} is already installed and up to date.`);
          process.exit(0);
        } else {
          log.info(
            `Current version (${versionMatch ? versionMatch[1] : 'unknown'}) differs from desired (${selectedVersion}). Updating...`,
          );
        }
      } catch (error) {
        log.warning(`Unable to verify current version. Proceeding with installation.`);
      }
    }

    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true, mode: 0o755 });
      log.success(`Directory created: ${chalk.cyan(binDir)}`);
    }

    log.info(`Detected platform: ${chalk.cyan(JSON.stringify(platform))}`);
    await downloadAndExtract(platform).catch((error) => {
      log.error(`Error during download or extraction: ${error.message}`);
      process.exit(0);
    });
    log.highlight('Installation completed successfully!');
    log.info(`Azion CLI has been installed in: ${chalk.cyan(binDir)}`);
    process.exit(0);
  } catch (error) {
    log.error(`Error during installation: ${error.message}`);
    process.exit(1);
  }
}

main();
