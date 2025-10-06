// utils/voterFourPrefixes.js
const mongoose = require("mongoose");

const BATCH_SIZE = 1000;
const VoterFourSchema = new mongoose.Schema({}, { strict: false, collection: "voterfours" });
const VoterFour = mongoose.model("VoterFour", VoterFourSchema);

function tokenize(name) {
  if (!name || typeof name !== "string") return [];
  return name
    .replace(/[^A-Za-z\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(t => t.toLowerCase());
}

// prefixes of length 2..5 for each token (tunable)
function prefixesForToken(t) {
  const out = [];
  for (let L = 2; L <= Math.min(5, t.length); L++) out.push(t.slice(0, L));
  return out;
}

function buildPrefixes(name) {
  const tokens = tokenize(name);
  const set = new Set();
  tokens.forEach(t => prefixesForToken(t).forEach(p => set.add(p)));
  return Array.from(set);
}

async function run(uri) {
  await mongoose.connect(uri, { maxPoolSize: 10 });
  const total = await VoterFour.countDocuments({});
  console.log(`Total docs: ${total}`);

  for (let skip = 0; skip < total; skip += BATCH_SIZE) {
    const docs = await VoterFour.find({}).skip(skip).limit(BATCH_SIZE).lean();
    const bulk = VoterFour.collection.initializeUnorderedBulkOp();

    for (const d of docs) {
      const nameEng = d["Voter Name Eng"] || d.voterNameEng || "";
      bulk.find({ _id: d._id }).updateOne({
        $set: {
          nameTokens: tokenize(nameEng),          // optional, useful for debugging
          namePrefixes: buildPrefixes(nameEng),   // <<—— main field we’ll query
        }
      });
    }

    if (docs.length) {
      await bulk.execute();
      console.log(`Updated ${Math.min(skip + docs.length, total)}/${total}`);
    }
  }

  console.log("Creating indexes…");
  await VoterFour.collection.createIndex({ namePrefixes: 1 });       // multikey
  await VoterFour.collection.createIndex({ initials: 1 });           // you already added initials*
  await VoterFour.collection.createIndex({ "Voter Name Eng": 1 });   // for sorting/prefix regex
  console.log("Done ✅");
  await mongoose.disconnect();
}

const uri = process.argv[2];
if (!uri) { console.error('Usage: node utils/voterFourPrefixes.js "<MONGODB_URI>"'); process.exit(1); }
run(uri).catch(err => { console.error(err); process.exit(1); });
