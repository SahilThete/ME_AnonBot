const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const handleSchema = new mongoose.Schema({
    userId: String,
    handle: String,
});

const Handle = mongoose.model('Handle', handleSchema);

module.exports = Handle;

