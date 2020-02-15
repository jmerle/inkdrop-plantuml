"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createImageURL = createImageURL;

var path = _interopRequireWildcard(require("path"));

var fs = _interopRequireWildcard(require("fs"));

var _plantumlEncoder = require("plantuml-encoder");

var _execa = _interopRequireDefault(require("execa"));

var _getStream = _interopRequireDefault(require("get-stream"));

var _bluebird = _interopRequireDefault(require("bluebird"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

_bluebird.default.config({
  cancellation: true
});

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

function getLocalImage(code) {
  return new _bluebird.default((resolve, reject, onCancel) => {
    try {
      const proc = (0, _execa.default)('java', ['-jar', '-Djava.awt.headless=true', getJarPath(), '-tpng', '-pipe']);
      onCancel(() => {
        proc.kill();
      });
      process.nextTick(() => {
        proc.stdin.write(code);
        proc.stdin.end();
      });
      proc.catch(() => {});
      proc.on('error', err => {
        if (err.code === 'ENOENT') {
          reject(new Error(`Please make sure Java is available on your PATH.`));
        } else {
          reject(err);
        }
      });

      _getStream.default.buffer(proc.stdout).then(buffer => {
        resolve('data:image/png;base64,' + buffer.toString('base64'));
      }).catch(err => reject(err.message));
    } catch (err) {
      reject(err);
    }
  });
}

function getServerImage(code, url) {
  return _bluebird.default.resolve(path.join(url, 'img', (0, _plantumlEncoder.encode)(code)));
}

function createImageURL(code) {
  if (inkdrop.config.get('plantuml.mode') === 'Local') {
    return getLocalImage(code);
  } else {
    return getServerImage(code, inkdrop.config.get('plantuml.serverUrl'));
  }
}
//# sourceMappingURL=generator.js.map