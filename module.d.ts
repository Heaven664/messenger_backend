declare namespace NodeJS {
  export interface ProcessEnv {
    DB_USER: string;
    DB_PASSWORD: string;
    JWT_SECRET_KEY: string;
    JWT_REFRESH_TOKEN: string;
    ORIGIN?: string;
  }
}
