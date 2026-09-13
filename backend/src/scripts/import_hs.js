import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import { HsCode } from '../models/HsCode.js';
import { normalizeHsCode } from '../utils/hs_helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export { normalizeHsCode };

/**
 * Normalizes and cleans raw HS code strings:
 * - strips trailing dots and punctuation
 * - converts 8-digit codes to XXXX.XX.XX
 * - converts 6-digit codes to XXXX.XX
 * - leaves 4-digit codes as XXXX
 */
export function cleanHsCode(raw) {
  if (!raw) return null;
  const cleaned = String(raw).trim().replace(/\.+$/, '');
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
  }
  if (digits.length === 6) {
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}`;
  }
  if (digits.length === 4) {
    return digits;
  }
  return null;
}

/**
 * Line parser for "New Text Document.txt"
 */
function parseTextLine(line) {
  const m = line.match(/^(\d+)\s+(.+)$/);
  if (!m) return null;
  const rest = m[2].trim();

  // 1. Match 8 digits: e.g. "0101.29.10", "0101 21 00", "0302.31 00", "0802. 61 00"
  let match = rest.match(/^(\d{4}[.\s]+\d{2}[.\s]+\d{2}\.?)(?:\s+(.*))?$/);
  if (match) {
    return { code: match[1].trim(), desc: (match[2] || '').trim() };
  }

  // 2. Match 6 digits: e.g. "0101 29", "0101.29", "8463.10.", "0102..29", "551311"
  match = rest.match(/^(\d{4}[.\s]*\.?\d{2}\.?)(?:\s+(.*))?$/);
  if (match) {
    return { code: match[1].trim(), desc: (match[2] || '').trim() };
  }

  // 3. Match 4 digits: e.g. "0101 Live horses...", "0305"
  match = rest.match(/^(\d{4})(?:\s+(.*))?$/);
  if (match) {
    return { code: match[1].trim(), desc: (match[2] || '').trim() };
  }

  return null;
}

/**
 * Basic CSV line parser handling quoted strings
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Parse directly from primary source: "forstandars/New Text Document.txt"
 */
export function parseFromTextDocument(textPath) {
  const content = fs.readFileSync(textPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const entries = new Map();
  let currentCode = null;
  let currentDescParts = [];

  function flush() {
    if (currentCode && currentDescParts.length > 0) {
      const norm = cleanHsCode(currentCode);
      if (norm) {
        let desc = currentDescParts.join(' ').replace(/\s+/g, ' ').replace(/^[-.:;\s]+/, '').trim();
        if (desc) {
          if (!entries.has(norm)) {
            entries.set(norm, desc);
          } else {
            const prev = entries.get(norm);
            if (desc.length > prev.length && prev.toLowerCase().startsWith('other')) {
              entries.set(norm, desc);
            }
          }
        }
      }
    }
    currentCode = null;
    currentDescParts = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || /^(SL\s*NO|HSN\s*CODE)/i.test(line)) continue;

    const parsed = parseTextLine(line);
    if (parsed) {
      flush();
      currentCode = parsed.code;
      if (parsed.desc) currentDescParts.push(parsed.desc);
    } else if (currentCode) {
      if (/^\d+\s+[A-Za-z]/.test(line)) {
        flush();
      } else {
        currentDescParts.push(line);
      }
    }
  }
  flush();
  return entries;
}

export async function importHsCodes(customSourcePath = null) {
  console.log("==================================================");
  console.log("       BIS Sahayak — HS-Codes Importer (Ground Truth) ");
  console.log("==================================================");

  // 1. Connect to MongoDB
  await connectDB();

  // 2. Check for primary source text file
  const textCandidates = [
    customSourcePath,
    path.resolve(__dirname, '../../../forstandars/New Text Document.txt'),
    path.resolve(process.cwd(), '../forstandars/New Text Document.txt'),
    path.resolve(process.cwd(), 'forstandars/New Text Document.txt')
  ].filter(Boolean);

  let textSourcePath = null;
  for (const p of textCandidates) {
    if (p.endsWith('.txt') && fs.existsSync(p)) {
      textSourcePath = p;
      break;
    }
  }

  const entriesMap = new Map();

  if (textSourcePath) {
    console.log(`📂 Parsing Ground-Truth Text Dataset: ${textSourcePath}`);
    const parsed = parseFromTextDocument(textSourcePath);
    for (const [k, v] of parsed.entries()) {
      entriesMap.set(k, v);
    }
    console.log(`✅ Parsed ${entriesMap.size} unique HS-codes directly from ${path.basename(textSourcePath)}`);

    // Also export synchronized CSV to both locations
    const csvContent = ['hs_code,description'];
    for (const [hs, desc] of entriesMap.entries()) {
      const escapedDesc = desc.includes(',') || desc.includes('"')
        ? `"${desc.replace(/"/g, '""')}"`
        : desc;
      csvContent.push(`${hs},${escapedDesc}`);
    }
    const fullCsv = csvContent.join('\n');
    const rootCsv = path.resolve(__dirname, '../../../hs_codes.csv');
    const backendCsv = path.resolve(__dirname, '../../data/hs_codes.csv');
    fs.writeFileSync(rootCsv, fullCsv, 'utf8');
    if (fs.existsSync(path.dirname(backendCsv))) {
      fs.writeFileSync(backendCsv, fullCsv, 'utf8');
    }
    console.log(`💾 Synchronized updated hs_codes.csv (${entriesMap.size} rows).`);
  } else {
    // Fallback to CSV
    const csvCandidates = [
      customSourcePath,
      path.resolve(__dirname, '../../data/hs_codes.csv'),
      path.resolve(__dirname, '../../../hs_codes.csv'),
      path.resolve(process.cwd(), 'data/hs_codes.csv'),
      path.resolve(process.cwd(), 'hs_codes.csv')
    ].filter(Boolean);

    let csvPath = null;
    for (const p of csvCandidates) {
      if (fs.existsSync(p)) {
        csvPath = p;
        break;
      }
    }

    if (!csvPath) {
      console.error("❌ Error: Could not find New Text Document.txt or hs_codes.csv.");
      process.exit(1);
    }

    console.log(`📂 Reading dataset from CSV: ${csvPath}`);
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    const rawDataRows = lines.slice(1);

    for (const rowLine of rawDataRows) {
      const row = parseCsvLine(rowLine);
      const rawHs = (row[0] || '').trim();
      const rawDesc = (row[1] || '').trim();
      const norm = cleanHsCode(rawHs);
      if (norm && rawDesc) {
        entriesMap.set(norm, rawDesc);
      }
    }
  }

  // 3. Batch upsert into MongoDB
  const BATCH_SIZE = 1000;
  const entries = Array.from(entriesMap.entries());
  let processedCount = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const operations = batch.map(([hs_code, description]) => ({
      updateOne: {
        filter: { hs_code },
        update: { $set: { hs_code, description } },
        upsert: true
      }
    }));

    await HsCode.bulkWrite(operations, { ordered: false });
    processedCount += batch.length;
    process.stdout.write(`\r💾 Upserting to MongoDB: ${processedCount} / ${entries.length} records...`);
  }

  console.log("\n");
  console.log("==================================================");
  console.log("          Import Completed Successfully           ");
  console.log("==================================================");
  console.log(`✅ Total Records in Database:  ${await HsCode.countDocuments()}`);
  console.log(`✅ Total Valid Unique Imported: ${entriesMap.size}`);
  console.log("==================================================");

  return {
    imported: entriesMap.size,
    totalInDb: await HsCode.countDocuments()
  };
}

// Allow direct CLI execution
if (process.argv[1] && process.argv[1].endsWith('import_hs.js')) {
  const customPath = process.argv[2] || null;
  importHsCodes(customPath)
    .then(() => {
      console.log("🎉 Importer finished.");
      process.exit(0);
    })
    .catch(err => {
      console.error("❌ Importer error:", err);
      process.exit(1);
    });
}
