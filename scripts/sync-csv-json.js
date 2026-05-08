const fs = require("fs");
const path = require("path");

const DATASETS = [
  {
    name: "weapons",
    jsonPath: path.join("data", "weapons.json"),
    csvPath: path.join("csv", "weapons.csv"),
    indent: 2,
    jsonBom: false
  },
  {
    name: "vehicles",
    jsonPath: path.join("data", "vehicles.json"),
    csvPath: path.join("csv", "vehicles.csv"),
    indent: 4,
    jsonBom: true
  }
];

const CSV_BOM = "\uFEFF";

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function stripBom(text) {
  return text.replace(/^\uFEFF/, "");
}

function readJson(file) {
  return JSON.parse(stripBom(readText(file)));
}

function writeIfChanged(file, content) {
  const previous = fs.existsSync(file) ? readText(file) : null;
  if (previous === content) {
    console.log(`Unchanged ${file}`);
    return false;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  console.log(`Wrote ${file}`);
  return true;
}

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return CSV_BOM;
  const columns = [];
  const seen = new Set();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }
  const lines = [
    columns.map(csvEscape).join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(","))
  ];
  return `${CSV_BOM}${lines.join("\n")}\n`;
}

function parseCsv(text) {
  const input = stripBom(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === "\"") {
        if (input[i + 1] === "\"") {
          field += "\"";
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === "\"") {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error("CSV has an unclosed quoted field");
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  while (rows.length && rows[rows.length - 1].every((cell) => cell === "")) rows.pop();
  return rows;
}

function columnTypes(rows) {
  const types = new Map();
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (value !== null && value !== undefined && !types.has(key)) {
        types.set(key, typeof value);
      }
    }
  }
  return types;
}

function parseCell(value, type, column) {
  const text = value.trim();
  if (text === "") return null;
  if (type === "number") {
    const number = Number(text);
    if (!Number.isFinite(number)) {
      throw new Error(`Column "${column}" expects a number, got "${value}"`);
    }
    return number;
  }
  if (type === "boolean") {
    if (/^(true|false)$/i.test(text)) return text.toLowerCase() === "true";
    throw new Error(`Column "${column}" expects true or false, got "${value}"`);
  }
  return value;
}

function fromCsv(csvText, templateRows) {
  const parsed = parseCsv(csvText);
  if (parsed.length === 0) return [];
  const columns = parsed[0].map((column) => column.trim());
  if (columns.some((column) => !column)) throw new Error("CSV header contains an empty column name");

  const types = columnTypes(templateRows);
  return parsed.slice(1)
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row) => {
      const item = {};
      for (let index = 0; index < columns.length; index += 1) {
        const column = columns[index];
        item[column] = parseCell(row[index] ?? "", types.get(column), column);
      }
      return item;
    });
}

function formatJson(rows, dataset) {
  const body = `${JSON.stringify(rows, null, dataset.indent)}\n`;
  return dataset.jsonBom ? `${CSV_BOM}${body}` : body;
}

function jsonToCsv() {
  for (const dataset of DATASETS) {
    const rows = readJson(dataset.jsonPath);
    writeIfChanged(dataset.csvPath, toCsv(rows));
  }
}

function csvToJson() {
  for (const dataset of DATASETS) {
    if (!fs.existsSync(dataset.csvPath)) {
      throw new Error(`Missing ${dataset.csvPath}. Run "node scripts/sync-csv-json.js json-to-csv" first.`);
    }
    const templateRows = readJson(dataset.jsonPath);
    const rows = fromCsv(readText(dataset.csvPath), templateRows);
    writeIfChanged(dataset.jsonPath, formatJson(rows, dataset));
  }
}

const command = process.argv[2];

try {
  if (command === "json-to-csv") {
    jsonToCsv();
  } else if (command === "csv-to-json") {
    csvToJson();
  } else {
    console.error("Usage: node scripts/sync-csv-json.js <json-to-csv|csv-to-json>");
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
