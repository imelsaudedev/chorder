import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Minimal RFC 4180 CSV parser — handles quoted fields with embedded commas and newlines
function parseCsv(text: string): Record<string, string>[] {
  const records: Record<string, string>[] = [];
  let headers: string[] = [];
  let fields: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  function pushField() {
    fields.push(field);
    field = "";
  }

  function pushRecord() {
    if (fields.length === 0) return;
    if (headers.length === 0) {
      headers = fields;
    } else {
      const record: Record<string, string> = {};
      headers.forEach((h, idx) => {
        record[h] = fields[idx] ?? "";
      });
      records.push(record);
    }
    fields = [];
  }

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 2;
      } else if (ch === '"') {
        inQuotes = false;
        i++;
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ",") {
        pushField();
        i++;
      } else if (ch === "\r" && next === "\n") {
        pushField();
        pushRecord();
        i += 2;
      } else if (ch === "\n" || ch === "\r") {
        pushField();
        pushRecord();
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  // last field/record
  if (field || fields.length > 0) {
    pushField();
    pushRecord();
  }

  return records;
}

function normalizeYoutubeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  // bare "youtu.be/..." or "youtube.com/..."
  if (trimmed.startsWith("youtu.be/") || trimmed.startsWith("youtube.com/")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Uso: npx tsx prisma/seed/import-youtube-urls.ts <caminho-do-csv>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(csvPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Arquivo não encontrado: ${resolvedPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(resolvedPath, "utf8");
  const rows = parseCsv(raw);

  console.log(`CSV carregado: ${rows.length} linhas\n`);

  let skipped = 0;
  let notFound = 0;
  let alreadyHasUrl = 0;
  let updated = 0;

  for (const row of rows) {
    const legacyId = parseInt(row["id"] ?? "", 10);
    if (isNaN(legacyId)) {
      skipped++;
      continue;
    }

    // Skip deleted / archived / duplicates
    if (
      row["Deletar"]?.trim() === "true" ||
      row["arquivada"]?.trim() === "true" ||
      row["Repetida"]?.trim() === "true"
    ) {
      skipped++;
      continue;
    }

    const refColumn = row["Referência"] ?? row["ReferÃªncia"] ?? "";
    const youtubeUrl = normalizeYoutubeUrl(refColumn);
    if (!youtubeUrl) {
      skipped++;
      continue;
    }

    const song = await prisma.song.findFirst({
      where: { legacyId },
      include: {
        arrangements: {
          where: { isServiceArrangement: false, isDeleted: false },
          orderBy: [{ isDefault: "desc" }, { id: "asc" }],
          take: 1,
        },
      },
    });

    if (!song || song.arrangements.length === 0) {
      console.log(`  ✗ não encontrado  [legacyId=${legacyId}] "${row["titulo"]}"`);
      notFound++;
      continue;
    }

    const arrangement = song.arrangements[0];

    if (arrangement.youtubeUrl) {
      console.log(`  – já tem URL     [legacyId=${legacyId}] "${song.title}"`);
      alreadyHasUrl++;
      continue;
    }

    await prisma.songArrangement.update({
      where: { id: arrangement.id },
      data: { youtubeUrl },
    });

    console.log(`  ✓ atualizado      [legacyId=${legacyId}] "${song.title}" → ${youtubeUrl}`);
    updated++;
  }

  console.log(`
Resultado:
  Atualizados:       ${updated}
  Já tinham URL:     ${alreadyHasUrl}
  Não encontrados:   ${notFound}
  Ignorados (sem URL / deletados): ${skipped}
`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
