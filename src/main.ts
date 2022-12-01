import { getInput, setFailed } from "@actions/core";
import { uploadAssetsAsync } from "./asset";


async function run() {
  try {
    const apiKey = getInput("api-key");
    const urlPrefix = getInput("url-prefix");
    const additionalKeyValues = JSON.parse(getInput("additional-key-values") || "{}");
    const globs = JSON.parse(getInput("file-globs-json"));

    if (!Array.isArray(globs) || !globs.every((g) => typeof g === "string")) {
      throw new Error(
        "file-globs-json input must be a json of array of strings"
      );
    }

    await uploadAssetsAsync(apiKey, urlPrefix, globs, additionalKeyValues);

  } catch (e) {
    setFailed(e.message);
  }
}

run();