import mongoose from 'mongoose';
await mongoose.connect('mongodb://127.0.0.1:27017/cinereserve');
const Screen = mongoose.model('Screen', new mongoose.Schema({}, { strict: false }));
const screen = await Screen.findOne().lean();
let total = 0;
for (const r of screen.seatingLayout?.rows || []) {
  total += (r.seats || []).filter(s => !s.isAisle).length;
}
console.log('Screen has total seats:', total);
await mongoose.disconnect();

