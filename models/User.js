import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    default: 10
  },
  messages: {
  type: Array,
  default: []
}

});

export default mongoose.model("User", userSchema);
