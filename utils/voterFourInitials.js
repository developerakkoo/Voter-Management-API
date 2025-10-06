/**
 * scripts/migrate_initials.js
 * Generates robust initials & normalized fields for VoterFour:
 *  - initials:        "ARS"
 *  - initialsSpaced:  "A R S"
 *  - initialsDotted:  "A.R.S"
 *  - nameNormalized:  "abanave renuka sharad"
 *  - nameCompact:     "abanaverenukasharad" (alnum only, lowercase)
 *
 * Safe for re-run; updates in batches; creates indexes at the end.
 */

const mongoose = require('mongoose');

const BATCH_SIZE = 1000;

// Minimal schema stub (adjust collection name if needed)
const VoterFourSchema = new mongoose.Schema({}, { strict: false, collection: 'voterfours' });
const VoterFour = mongoose.model('VoterFour', VoterFourSchema);

function tokenizeNameEng(name) {
  if (!name || typeof name !== 'string') return [];

  // Split on spaces, hyphens, dots, commas & multiple unicode spaces
  const raw = name
    .replace(/[_]+/g, ' ')               // underscores to space
    .replace(/[.,/\\]+/g, ' ')           // dots/slash to space
    .replace(/[-]+/g, ' ')               // hyphens to space
    .replace(/\s+/g, ' ')                // squeeze spaces
    .trim();

  // Keep tokens with letters (A–Z) – ignore numerics & empty
  const tokens = raw
    .split(' ')
    .map(t => t.replace(/[^A-Za-z]+/g, '')) // letters only
    .filter(Boolean);

  return tokens;
}

function computeInitialsVariants(nameEng) {
  const tokens = tokenizeNameEng(nameEng);
  if (!tokens.length) {
    return {
      initials: '',
      initialsSpaced: '',
      initialsDotted: '',
      nameNormalized: '',
      nameCompact: '',
    };
  }

  const initialsArr = tokens.map(t => t[0].toUpperCase());
  const initials = initialsArr.join('');
  const initialsSpaced = initialsArr.join(' ');
  const initialsDotted = initialsArr.join('.');

  const nameNormalized = tokens.join(' ').toLowerCase();                  // e.g., "abanave renuka sharad"
  const nameCompact = tokens.join('').toLowerCase();                      // e.g., "abanaverenukasharad"

  return { initials, initialsSpaced, initialsDotted, nameNormalized, nameCompact };
}

async function run(uri) {
  await mongoose.connect(uri, { maxPoolSize: 10 });

  const total = await VoterFour.countDocuments({});
  console.log(`Total documents: ${total}`);

  let processed = 0;
  while (processed < total) {
    const docs = await VoterFour.find({})
      .skip(processed)
      .limit(BATCH_SIZE)
      .lean();

    const bulk = VoterFour.collection.initializeUnorderedBulkOp();
    for (const d of docs) {
      const nameEng = d['Voter Name Eng'] || d.voterNameEng || '';
      const {
        initials,
        initialsSpaced,
        initialsDotted,
        nameNormalized,
        nameCompact,
      } = computeInitialsVariants(nameEng);

      bulk.find({ _id: d._id }).updateOne({
        $set: {
          initials,
          initialsSpaced,
          initialsDotted,
          nameNormalized,
          nameCompact,
        }
      });
    }

    if (docs.length) {
      const res = await bulk.execute();
      processed += docs.length;
      console.log(`Updated ${processed}/${total}`);
    } else {
      break;
    }
  }

  console.log('Creating helpful indexes (idempotent)…');
  // Indexes that speed up common lookups:
  await VoterFour.collection.createIndex({ initials: 1 });
  await VoterFour.collection.createIndex({ initialsSpaced: 1 });
  await VoterFour.collection.createIndex({ initialsDotted: 1 });
  await VoterFour.collection.createIndex({ "Voter Name Eng": 1 }, { collation: { locale: "en", strength: 1 } });
  await VoterFour.collection.createIndex({ nameNormalized: 1 });
  await VoterFour.collection.createIndex({ nameCompact: 1 });

  await mongoose.disconnect();
  console.log('Done ✅');
}

const uri = process.argv[2];
if (!uri) {
  console.error('Usage: node scripts/migrate_initials.js "<MONGODB_URI>"');
  process.exit(1);
}

run(uri).catch(err => { console.error(err); process.exit(1); });
