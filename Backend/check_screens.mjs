import mongoose from 'mongoose';
await mongoose.connect('mongodb://127.0.0.1:27017/cinereserve');
const Screen = mongoose.model('Screen', new mongoose.Schema({}, { strict: false }));
const screens = await Screen.find().lean();
console.log(`Found ${screens.length} screens.`);
if (screens.length > 0) {
  console.log('Sample screen 0:', {
    id: screens[0]._id,
    cinema: screens[0].cinema,
    name: screens[0].name,
    rowsCount: screens[0].seatingLayout?.rows?.length,
    sampleRow: screens[0].seatingLayout?.rows?.[0]
  });
}
await mongoose.disconnect();

