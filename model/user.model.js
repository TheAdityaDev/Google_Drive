const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type:String,
    required:true,
    trim:true,
    lowercase:true,
    unique:true,
    minlength:[3,'Username must be at least 3 character']
  },
  email:  {
    type:String,
    required:true,
    trim:true,
    lowercase:true,
    unique:true,
    minlength:[6,'Email must be at least 6 character']
  },
  password:  {
    type:String,
    required:true,
    trim:true,
    select:false,
    unique:true,
    minlength:[8,'Username must be at least 8 character']
  },
},{timestamps:true});

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model("user", UserSchema);
 
module.exports = UserModel