// import mongoose from "mongoose";
// const { Schema } = mongoose;

// const userSchema = new Schema(
//   {
//     firstName: { type: String, required: ["First name required"] },
//     lastName: { type: String, required: ["Last name required"] },
//     email: { type: String, required: ["Email required"] },
//     password: { type: String, required: ["Password required"] },
//     categories: [{ label: String, icon: String }],
//   },
//   { timestamps: true }
// );

// export default new mongoose.model("User", userSchema);
import mongoose from "mongoose";
const { Schema } = mongoose;

// Define the User schema
const userSchema = new Schema(
  {
    firstName: { 
      type: String, 
      required: [true, "First name required"]
    },
    lastName: { 
      type: String, 
      required: [true, "Last name required"]
    },
    email: { 
      type: String, 
      required: [true, "Email required"],
      unique: true, // Ensure email addresses are unique
      lowercase: true, // Convert to lowercase before saving
      trim: true // Remove leading and trailing whitespace
    },
    password: { 
      type: String, 
      required: [true, "Password required"]
    },
    categories: [
      {
        label: { type: String, required: true }, // Ensure label is required
        icon: { type: String, required: true } // Ensure icon is required
      }
    ],
  },
  { 
    timestamps: true 
  }
);

// Create and export the User model
export default mongoose.model("User", userSchema);
