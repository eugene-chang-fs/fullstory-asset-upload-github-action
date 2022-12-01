import { platform, tmpdir } from "os";
import { join } from "path";
import * as glob from "glob";
import { promisify } from "util";
import { writeFile } from "fs/promises";
import { createWriteStream, rename, stat } from "fs";
import * as https from "https";
import * as targz from "targz";
import { exec, spawn } from "child_process";

const globAsync = promisify(glob);
const statAsync = promisify(stat);

type KeyValues = {
  [key: string]: string;
};

type AssetUploadOptions = {
  binaryPath?: string;
  version?: string;
};

export async function uploadAssetsAsync(
  apiKey: string,
  urlPrefix: string,
  globs: string[],
  additionalKeyValues: KeyValues,
  options: AssetUploadOptions = {}
): Promise<string> {
  const cwd = process.cwd();

  const allFiles = (await Promise.all(globs.map((g) => globAsync(g)))).reduce(
    (c, n) => (c.push(...n.map((entry) => join(cwd, entry))), c),
    []
  );
  const assets = Object.assign(
    {},
    ...allFiles.map((f) => ({ [`${urlPrefix}/${f}`]: { path: f } }))
  );
  const assetMapContent = {
    assets,
    version: "2",
    ...additionalKeyValues,
  };

  const outputAssetMap = join(tmpdir(), `temp-asset-${Date.now()}.jsonc`);
  await writeFile(outputAssetMap, JSON.stringify(assetMapContent, null, 2));

  const executable = await maybeDownloadBinaryAsync(options);

  const cmdArgs = ['upload', outputAssetMap, '--api-key', apiKey, '--asset-root', cwd];
  const output = await new Promise<string>((resolve, reject) => {
    const proc = spawn(executable, cmdArgs);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', d => stdout += d);
    proc.stderr.on('data', d => stderr += d);
    proc.on('close', code => {
      if (code !== 0) {
        return reject(stderr);
      } else {
        resolve(stdout.trim());
      }
    });
  });

  return output;
}

async function maybeDownloadBinaryAsync(
  options: AssetUploadOptions
): Promise<string> {
  const binaryPath =
    options.binaryPath ?? join(tmpdir(), `fullstory-asset-uploader`);
  const version = options.version ?? "1.0.0";
  try {
    const currentFileStat = await statAsync(binaryPath);
    if (currentFileStat.isFile) {
      return binaryPath;
    }
  } catch {
    // do nothing
  }

  const osSuffix = getOsSuffix();
  const pathToArchive = await downloadBinaryAsync(version, osSuffix);
  return extractAndMoveAsync(pathToArchive, binaryPath);
}

function getOsSuffix(): string {
  const os = platform();
  let osSuffix: string;
  if (os.match(/darwin|macos/i)) {
    return "macos";
  } else if (os.match(/linux/i) && process.arch === "x64") {
    return "linux-x86-64";
  } else {
    throw new Error(`${os} is not a supported platform`);
  }
}

async function downloadBinaryAsync(
  version: string,
  osSuffix: string
): Promise<string> {
  const tmpPath = join(tmpdir(), `fullstory-asset-uploader-${Date.now()}`);
  const outStream = createWriteStream(tmpPath);
  await new Promise<void>((resolve, reject) => {
    https.get(
      `https://storage.googleapis.com/fullstoryapp-web-sdk-releases/fullstory-asset-uploader/${version}/fullstory-asset-uploader-${version}-${osSuffix}.tar.gz`,
      (r) => {
        r.pipe(outStream);
        outStream.on("finish", () => {
          outStream.close();
          resolve();
        });

        outStream.on("error", reject);
      }
    );
  });

  return tmpPath;
}

async function extractAndMoveAsync(
  pathToArchive: string,
  binaryPath: string
): Promise<string> {
  const extractTo = join(
    tmpdir(),
    `fullstory-asset-uploader-extract-${Date.now()}`
  );
  await new Promise<void>((resolve, reject) => {
    targz.decompress(
      {
        src: pathToArchive,
        dest: extractTo,
      },
      (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });

  return new Promise((resolve, reject) => {
    rename(join(extractTo, "fullstory-asset-uploader"), binaryPath, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(binaryPath);
    });
  });
}
