/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import session from 'express-session';

declare module 'express-session' {
  export interface SessionData {
    previousUrl?: string;
  }
}
