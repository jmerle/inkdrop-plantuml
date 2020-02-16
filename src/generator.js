import * as path from 'path';
import * as fs from 'fs';
import { encode } from 'plantuml-encoder';
import execa from 'execa';
import getStream from 'get-stream';
import PCancelable from 'p-cancelable';

function getJarPath() {
  const vendorDirectory = path.resolve(__dirname, '../vendor');
  const files = fs.readdirSync(vendorDirectory);

  const jarFiles = files
    .filter(file => file.endsWith('.jar'))
    .sort()
    .reverse();

  if (jarFiles.length === 0) {
    const message = `Please ensure there is a PlantUML jar in ${vendorDirectory}`;
    throw new Error(message);
  }

  return path.join(vendorDirectory, jarFiles[0]);
}

function getLocalImage(code) {
  return new PCancelable((resolve, reject, onCancel) => {
    try {
      const proc = execa('java', [
        '-jar',
        '-Djava.awt.headless=true',
        getJarPath(),
        '-tpng',
        '-pipe',
      ]);

      onCancel.shouldReject = false;
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

      getStream
        .buffer(proc.stdout)
        .then(buffer => {
          resolve('data:image/png;base64,' + buffer.toString('base64'));
        })
        .catch(err => reject(err.message));
    } catch (err) {
      reject(err);
    }
  });
}

function getServerImage(code, url) {
  return Promise.resolve(path.join(url, 'img', encode(code)));
}

export function createImageURL(code) {
  if (inkdrop.config.get('plantuml.mode') === 'Local') {
    return getLocalImage(code);
  } else {
    return getServerImage(code, inkdrop.config.get('plantuml.serverUrl'));
  }
}
