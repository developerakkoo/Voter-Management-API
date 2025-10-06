// utils/searchHelpers.js (optional to keep clean)
const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function parseQuery(qRaw) {
  const raw = (qRaw || "").trim();
  const cleaned = raw.replace(/[^A-Za-z\s]+/g, " ").replace(/\s+/g, " ").trim();

  const tokens = cleaned ? cleaned.split(" ") : [];
  const tightInitials = tokens.length === 1 && /^[A-Za-z]{2,10}$/.test(tokens[0]);
  const initialsLetters = tightInitials
    ? tokens[0].toUpperCase().split("")
    : tokens.map(t => t[0]?.toUpperCase()).filter(Boolean);

  return { raw, tokens, initialsLetters, tightInitials };
}

function buildCompound(qRaw, flags = {}) {
  const { tokens, initialsLetters } = parseQuery(qRaw);

  // Must/should/filter
  const must = [];
  const should = [];
  const filter = [];

  // 1) Strong initials boost (exact equals)
  if (initialsLetters.length >= 2) {
    const init = initialsLetters.join("");
    should.push(
      { equals: { path: "initials", value: init, score: { boost: { value: 12 } } } },
      { equals: { path: "initialsSpaced", value: initialsLetters.join(" "), score: { boost: { value: 11 } } } },
      { equals: { path: "initialsDotted", value: initialsLetters.join("."), score: { boost: { value: 10 } } } }
    );
  }

  // 2) Word-prefix feel: autocomplete & wildcard across tokens
  if (qRaw && qRaw.length >= 1) {
    // Full-query autocomplete on names
    should.push(
      {
        autocomplete: {
          path: "Voter Name Eng.auto",
          query: qRaw,
          fuzzy: { maxEdits: 1, prefixLength: 1 },
          score: { boost: { value: 8 } }
        }
      },
      {
        autocomplete: {
          path: "Relative Name Eng.auto",
          query: qRaw,
          fuzzy: { maxEdits: 1, prefixLength: 1 },
          score: { boost: { value: 4 } }
        }
      }
    );
  }

  // 3) Ordered sequence (e.g., "Ab R S") using phrase on tokens
  if (tokens.length >= 2) {
    should.push({
      phrase: {
        path: "Voter Name Eng",
        query: tokens,
        slop: 2,
        score: { boost: { value: 7 } }
      }
    });
  }

  // 4) Ensure presence of each token as a prefix (wildcards) to push relevancy
  tokens.forEach(t => {
    if (!t) return;
    should.push({
      wildcard: {
        path: "Voter Name Eng.kw",
        query: `${t}*`,
        allowAnalyzedField: true,
        score: { boost: { value: 3 } }
      }
    });
  });

  // 5) Fuzzy text across several fields (typos)
  if (qRaw) {
    should.push(
      {
        text: {
          path: ["Voter Name Eng", "Relative Name Eng", "Address Eng"],
          query: qRaw,
          fuzzy: { maxEdits: 1 },
          score: { boost: { value: 3 } }
        }
      },
      {
        text: {
          path: ["Voter Name", "Address", "Booth", "Booth Eng"],
          query: qRaw,
          score: { boost: { value: 2 } }
        }
      }
    );
  }

  return { must, should, filter, minimumShouldMatch: 1 };
}

module.exports = { escapeRegex, parseQuery, buildCompound };
