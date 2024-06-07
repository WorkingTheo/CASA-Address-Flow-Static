import 'dotenv/config';
import path from 'path';
import express from 'express';
import { noSniff } from 'helmet';
import { AppConfig } from 'environment';
import { MemoryStore } from 'express-session';

import app from "./app";

const expressApp = express();
expressApp.use(noSniff());

/**
 * we have to consider where these assets will live relative to the transpiled JS
 * 
 * for example, in the gulpfile the 'img' task moves all required images to '/dist/public/images'
 * this file (server.ts) will be transpiled into 'server.js' and will be located in '/dist/server.js'
 * now all the images are accessible to 'server.js' with the relative import './public/images' 
 */
expressApp.use('/css', express.static(path.resolve(__dirname, './public/css')));
expressApp.use('/assets/js', express.static(path.resolve(__dirname, './public/javascript')));
expressApp.use('/assets/images', express.static(path.resolve(__dirname, './public/images')));
expressApp.use('/assets/fonts', express.static(path.resolve(__dirname, './public/fonts')));

/**
 * since we are using TypeScript, we can declare a custom 'environment' module, which allows us to 
 * specify 'AppConfig' interface, which enables auto-suggestion for our environment variables 
 * 
 * this does mean that updating '.env' file will require updating the 'AppConfig' interface, 
 * which is located at '../typings/environment/index.d.ts' 
 */
const appConfig = { ...process.env as AppConfig };
const name = appConfig.SESSION_ID;
const secret = appConfig.SESSIONS_SECRET;
const ttl = parseInt(appConfig.SESSIONS_TTL_SECONDS);
const secure = appConfig.SECURE_COOKIES === 'true';
const casaMountUrl = appConfig.CASA_MOUNT_URL;
const port = parseInt(appConfig.SERVER_PORT);

// !!IMPORTANT: this is ONLY for dev - MemoryStore is not suitable for PROD!
const sessionStore = new MemoryStore();

const casaApp = app(name, secret, ttl, secure, sessionStore);

expressApp.use(casaMountUrl, casaApp);

expressApp.listen(port, () => {
  console.log(`running on port: ${port}`);
});
