import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const TS_EXT = [".ts", ".tsx"];

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (!context.parentURL || !specifier.startsWith(".")) {
      throw error;
    }
    const parentDir = dirname(fileURLToPath(context.parentURL));
    for (const ext of TS_EXT) {
      const candidate = join(parentDir, specifier + ext);
      if (existsSync(candidate)) {
        return { url: pathToFileURL(candidate).href, shortCircuit: true };
      }
    }
    throw error;
  }
}

export async function load(url, context, nextLoad) {
  if (url.startsWith("file:") && url.split("?")[0].endsWith(".json")) {
    const source = readFileSync(fileURLToPath(url), "utf8");
    return {
      format: "module",
      shortCircuit: true,
      source: `export default ${source};\n`,
    };
  }
  return nextLoad(url, context);
}
