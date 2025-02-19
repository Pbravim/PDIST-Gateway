import App from './app.js';
import dotenv from 'dotenv';

dotenv.config();


App.start(process.env.PORT);
