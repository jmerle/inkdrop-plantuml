"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shouldCheckForJarUpdates = shouldCheckForJarUpdates;
exports.checkForJarUpdates = checkForJarUpdates;
exports.getJarPath = getJarPath;

var fs = _interopRequireWildcard(require("fs"));

var path = _interopRequireWildcard(require("path"));

var util = _interopRequireWildcard(require("util"));

var stream = _interopRequireWildcard(require("stream"));

var _rssParser = _interopRequireDefault(require("rss-parser"));

var _got = _interopRequireDefault(require("got"));

var _temp = _interopRequireDefault(require("temp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const pipeline = util.promisify(stream.pipeline);
let updateLock = false;

async function downloadDirectLink(url, filePath, retries) {
  console.log(retries, url);

  if (retries < 0) {
    throw new Error(`Could not download ${url}, too many retries`);
  }

  try {
    const stream = _got.default.stream(url, {
      timeout: {
        connect: 2500
      }
    });

    await pipeline(stream, fs.createWriteStream(filePath));
  } catch (err) {
    if (err instanceof _got.default.TimeoutError) {
      const currentTimestamp = /ts=(\d+)/.exec(url)[1];
      const newTimestamp = parseInt(currentTimestamp, 10) + 1;
      const newUrl = url.replace(currentTimestamp, newTimestamp);
      return downloadDirectLink(newUrl, filePath, retries - 1);
    }

    throw err;
  }
}

async function download(urlSuffix, filePath) {
  const suffixWithoutSlash = urlSuffix.substr(1);
  const mirrorUrl = `https://sourceforge.net/settings/mirror_choices?projectname=plantuml&filename=${suffixWithoutSlash}`;
  const mirrorResponse = await (0, _got.default)(mirrorUrl, {
    timeout: {
      connect: 2500
    },
    retry: 5
  });
  const mirrorBody = mirrorResponse.body;
  const directLink = /<a href="([^"]+)">direct link<\/a>/.exec(mirrorBody)[1];
  await downloadDirectLink(directLink, filePath, 5);
}

function shouldCheckForJarUpdates() {
  const lastCheckStr = inkdrop.config.get('plantuml.lastUpdateCheck');
  const lastCheck = parseInt(lastCheckStr || 0, 10);
  const now = new Date().getTime();
  const updateCheckInterval = 24 * 60 * 60 * 1000;
  return now - lastCheck >= updateCheckInterval;
}

async function checkForJarUpdates(force) {
  if (updateLock) {
    if (force) {
      alert('Already checking for updates and/or downloading an update.');
    }

    return;
  }

  if (!force && !shouldCheckForJarUpdates()) {
    return;
  }

  inkdrop.config.set('plantuml.lastUpdateCheck', new Date().getTime());

  try {
    updateLock = true;
    const feedUrl = 'https://sourceforge.net/projects/plantuml/rss?path=/';
    const feed = await new _rssParser.default().parseURL(feedUrl);
    const latestJarItem = feed.items.find(item => {
      return /plantuml([.0-9]+)\.jar/.test(item.title);
    });
    const currentJarPath = getJarPath();
    const currentJar = path.basename(currentJarPath);
    const latestJar = path.basename(latestJarItem.title);

    if (currentJar !== latestJar) {
      const message = `PlantUML update found (${currentJar} -> ${latestJar}). Do you want to update?`;

      if (confirm(message)) {
        const jarUrlSuffix = latestJarItem.title;
        const jarDirectory = path.dirname(currentJarPath);
        const jarFilename = path.basename(latestJarItem.title);
        const jarLocation = path.join(jarDirectory, jarFilename);

        const tmpLocation = _temp.default.path({
          suffix: '.jar'
        });

        await download(jarUrlSuffix, tmpLocation);
        fs.renameSync(tmpLocation, jarLocation);
      }
    } else if (force) {
      alert('PlantUML jar is already of the latest version.');
    }
  } catch (err) {
    console.error('PlantUML update error', err);
  } finally {
    updateLock = false;
  }
}

function getJarPath() {
  const vendorDirectory = path.resolve(__dirname, '../vendor');
  const files = fs.readdirSync(vendorDirectory);
  const jarFiles = files.filter(file => file.endsWith('.jar')).sort().reverse();

  if (jarFiles.length === 0) {
    const message = `Please ensure there is a PlantUML jar in ${vendorDirectory}`;
    throw new Error(message);
  }

  return path.join(vendorDirectory, jarFiles[0]);
}
//# sourceMappingURL=jar.js.map