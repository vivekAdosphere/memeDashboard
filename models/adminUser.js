const mongoose = require('mongoose')
const Schema = mongoose.Schema

const admins = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, required: true, default: 'admin', enum: ['admin', 'super-admin'] },
        radiocity: { type: String, required: false, default: null }
    },
    { timestamps: true }
)

module.exports = mongoose.model('AdminUser', admins)
