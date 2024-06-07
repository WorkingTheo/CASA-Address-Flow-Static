declare module 'environment' {
  export interface AppConfig extends NodeJS.ProcessEnv {
    NODE_VERSION: string; 
    NODE_ENV: 'dev' | 'test' | 'staging' | 'production';

    SERVER_PORT: string; 
    
    CASA_MOUNT_URL: string; 

    SESSION_ID: string; 
    SESSIONS_SECRET: string; 
    SESSIONS_TTL_SECONDS: string; 
    SECURE_COOKIES: string;
  }
}
