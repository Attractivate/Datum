/**
 * Test matching for Project Matador duplicates
 */

const matadorProjects = [
  { id: "62e38cdf-d84e-44e8-a500-fb177ba69222", name: "Project Matador" },
  {
    id: "2781444a-49f5-450e-bb39-98e7a4af8b48",
    name: "Project Matador, Donald J. Trump Generating Plant - Units 1-4",
  },
  { id: "e03fc97f-9d36-4658-87c9-c887bf8f59b5", name: "Project Matador Gas Plant (PMG)" },
];

function extractBaseName(name: string): string {
  return name.split(/[,\(]/)[0].toLowerCase().trim();
}

function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const d: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) d[i][0] = i;
  for (let j = 0; j <= len2; j++) d[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }

  return d[len1][len2];
}

function nameSimilarity(s1: string, s2: string): number {
  const s1Lower = s1.toLowerCase().trim();
  const s2Lower = s2.toLowerCase().trim();

  if (s1Lower === s2Lower) return 1.0;

  const s1Base = extractBaseName(s1);
  const s2Base = extractBaseName(s2);

  if (s1Base === s2Base) return 1.0;

  const maxLen = Math.max(s1Base.length, s2Base.length);
  const distance = levenshteinDistance(s1Base, s2Base);
  const similarity = 1 - distance / maxLen;

  return Math.max(0, Math.min(1, similarity));
}

function shouldMatch(
  name1: string,
  name2: string,
  sim: number
): { matches: boolean; reason: string; score: number } {
  if (sim >= 0.80) {
    return { matches: true, reason: "80%+ name similarity", score: sim };
  }

  if (sim >= 0.70) {
    return { matches: true, reason: "70%+ name similarity", score: 0.70 };
  }

  // Check if first 2 words match
  const base1 = extractBaseName(name1).split(/\s+/);
  const base2 = extractBaseName(name2).split(/\s+/);
  const minWords = Math.min(2, base1.length, base2.length);

  let sameFirstWords = true;
  for (let i = 0; i < minWords; i++) {
    if (base1[i] !== base2[i]) {
      sameFirstWords = false;
      break;
    }
  }

  if (sameFirstWords && minWords >= 2) {
    return { matches: true, reason: "same first 2 words", score: 0.68 };
  }

  return { matches: false, reason: "no match", score: sim };
}

// Test all pairs
console.log("Testing Project Matador matching:\n");

for (let i = 0; i < matadorProjects.length; i++) {
  for (let j = i + 1; j < matadorProjects.length; j++) {
    const p1 = matadorProjects[i];
    const p2 = matadorProjects[j];

    const sim = nameSimilarity(p1.name, p2.name);
    const base1 = extractBaseName(p1.name);
    const base2 = extractBaseName(p2.name);

    const { matches, reason, score } = shouldMatch(p1.name, p2.name, sim);

    console.log(`\n"${p1.name}"`);
    console.log(`vs`);
    console.log(`"${p2.name}"\n`);
    console.log(`Base 1: "${base1}"`);
    console.log(`Base 2: "${base2}"`);
    console.log(`Similarity: ${(sim * 100).toFixed(1)}%`);
    console.log(`Reason: ${reason}`);
    console.log(`Score: ${score.toFixed(2)}`);
    console.log(`Should match: ${matches ? "✓ YES" : "✗ NO"}`);
  }
}
