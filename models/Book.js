const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    bookName: { type: String, required: true },
    bookAuthor: { type: String, required: true },
    bookPages: Number,
    bookPrice: Number,
    bookState: { type: String, enum: ['Available', 'Issued'], default: 'Available' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', bookSchema);
