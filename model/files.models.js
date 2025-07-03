const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    path:{
        type:String,
        required:[true , 'Please enter vaild path']
    },
    originalname:{
        type:String,
        required:[true , 'Original Name is required']
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:[true , 'User is required']
    }
})
const file = mongoose.model('File',fileSchema);
module.exports = file;
