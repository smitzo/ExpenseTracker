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
