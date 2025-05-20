// const mongoose = require('mongoose');
// mongoose.connect('mongodb+srv://Raj:Rajaryan@cluster0.crfzpz6.mongodb.net/Education').then(()=>{
    
//     console.log('connected');
// }).catch((err)=>{
//     console.log(err);
// });

// // test

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Education', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});
