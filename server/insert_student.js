const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/SDNProject')
  .then(async () => {
    console.log("Connected to MongoDB");

    try {
      // Remove if exists to avoid duplicate key error
      await User.deleteOne({ userName: "student_new_02" });
      await User.deleteOne({ email: "student_new_02@gmail.com" });

      const newUser = new User({
        fullName: "Nguyen Van Student Two",
        userName: "student_new_02",
        password: "$2b$10$9glVcWUcfiUT3giB69AiPe8qtHMhNk4JEW7U0g/vRltU0VypMbCgG",
        email: "student_new_02@gmail.com",
        number: "0902000204",
        birthday: new Date("2006-05-15T00:00:00.000Z"),
        address: "Ha Noi City",
        roleId: "r3"
      });

      await newUser.save();
      console.log("New student created successfully!");
    } catch (err) {
      console.error("Error creating student:", err);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error("Connection error", err);
  });
