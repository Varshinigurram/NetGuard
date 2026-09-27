import fs from "node:fs";
import path from "node:path";

const dataDirectory = path.resolve(process.cwd(), "data");

function ensureDataDirectory(): void {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, {
      recursive: true
    });
  }
}

export function readJsonFile<T>(
  fileName: string,
  defaultValue: T
): T {
  ensureDataDirectory();

  const filePath = path.join(
    dataDirectory,
    fileName
  );

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify(defaultValue, null, 2),
      "utf-8"
    );

    return defaultValue;
  }

  const content = fs.readFileSync(
    filePath,
    "utf-8"
  ).trim();

  if (!content) {
    return defaultValue;
  }

  return JSON.parse(content) as T;
}

export function writeJsonFile<T>(
  fileName: string,
  data: T
): void {
  ensureDataDirectory();

  const filePath = path.join(
    dataDirectory,
    fileName
  );

  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}