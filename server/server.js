// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
// import connect from "./database/mongodb.js";
// import passport from "passport";
// import passportConfig from "./config/passport.js";
// import * as dotenv from "dotenv";
// import routes from "./routes/index.js";
// import { generateCSV } from "./utils/csvUtils.js";
// import { sendEmail } from "./utils/emailUtils.js";

// dotenv.config();

// const PORT = process.env.PORT || 4000;
// const app = express();

// app.use(cors());
// app.use(bodyParser.json());
// app.use(passport.initialize());
// passportConfig(passport);

// // Ensure authentication middleware is properly set
// const auth = passport.authenticate("jwt", { session: false });

// // Apply routes with authentication where necessary
// app.use("/", routes);

// // Endpoint to generate and send CSV
// app.post('/send-csv', auth, async (req, res) => {
//   try {
//     // Ensure req.user and req.user.categories are defined
//     const user = req.user;
//     if (!user || !user.categories) {
//       return res.status(400).json({ message: 'User or categories not found' });
//     }

//     // Define file path
//     const filePath = './categories.csv';

//     // Generate CSV file
//     await generateCSV(user.categories, filePath);

//     // Send email with CSV attachment
//     await sendEmail(
//       user.email,
//       'Your Categories CSV',
//       'Please find the attached CSV file with your categories.',
//       [{ path: filePath }]
//     );

//     // Send success response
//     res.status(200).json({ message: 'CSV sent successfully' });
//   } catch (error) {
//     // Log and respond with error
//     console.error('Error sending CSV:', error.message);
//     res.status(500).json({ message: 'Error sending CSV', error: error.message });
//   }
// });

// async function startServer() {
//   try {
//     await connect(); // Ensure database connection is established
//     app.listen(PORT, () => {
//       console.log(`Server is running at http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     console.error("Failed to start server:", error.message);
//     process.exit(1);
//   }
// }

// startServer();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connect from './database/mongodb.js';
import passport from 'passport';
import passportConfig from './config/passport.js';
import * as dotenv from 'dotenv';
import routes from './routes/index.js';
import { generateCSV } from './utils/csvUtils.js';
import { sendEmail } from './utils/emailUtils.js';
import logger from './utils/logger.js'; // Ensure logger is imported

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
passportConfig(passport);

const auth = passport.authenticate('jwt', { session: false });

app.use('/', routes);

// Endpoint to generate and send CSV
// app.post('/send-csv', auth, async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user || !user.categories) {
//       return res.status(400).json({ message: 'User or categories not found' });
//     }

//     const filePath = './categories.csv'; // Define file path

//     await generateCSV(user._id, filePath); // Pass the user ID for CSV generation

//     await sendEmail(
//       user.email,
//       'Your Data is in this CSV',
//       'Please find the attached CSV file with your categories.',
//       [{ path: filePath }]
//     );

//     res.status(200).json({ message: 'CSV sent succesfully' });
//   } catch (error) {
//     logger.error('Error sending CSV:', error);
//     res.status(500).json({ message: 'Error sending CSV', error: error.message });
//   }
// }); 

app.post('/send-csv', auth, async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.categories) {
      return res.status(400).json({ message: 'User or categories not found' });
    }

    console.log('Categories:', user.categories); // Add this line

    const filePath = './categories.csv';
    await generateCSV(user.categories, filePath);

    await sendEmail(
      user.email,
      'Your Categories CSV',
      'Please find the attached CSV file with your categories.',
      [{ path: filePath }]
    );

    res.status(200).json({ message: 'CSV sent successfully' });
  } catch (error) {
    console.error('Error sending CSV:', error.message);
    res.status(500).json({ message: 'Error sending CSV', error: error.message });
  }
});


async function startServer() {
  try {
    await connect(); // Ensure database connection is established
    app.listen(PORT, () => {
      logger.info(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
