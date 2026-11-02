import mongoose from 'mongoose';
await mongoose.connect('mongodb://127.0.0.1:27017/cinereserve');

const City = mongoose.model('City', new mongoose.Schema({}, { strict: false }));
const Cinema = mongoose.model('Cinema', new mongoose.Schema({}, { strict: false }));
const Screen = mongoose.model('Screen', new mongoose.Schema({}, { strict: false }));

const anantapur = await City.findOne({ name: /Anantapur/i }).lean();
console.log('Anantapur city ID:', anantapur?._id);

const cinemas = await Cinema.find({ city: anantapur._id }).lean();
console.log('Anantapur cinemas count:', cinemas.length);
for (const c of cinemas) {
  const sc = await Screen.find({ cinema: c._id }).lean();
  console.log(`Cinema: ${c.name} (${c._id}) has ${sc.length} screens:`);
  for (const s of sc) {
    console.log(`  - ${s.name} (${s._id})`);
  }
}

await mongoose.disconnect();

