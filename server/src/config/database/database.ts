import { Pool, PoolConfig } from "pg";

let pool: Pool | undefined;

const getDatabaseCredentials = async (): Promise<PoolConfig> => {
  const port = parseInt(process.env.POSTGRES_PORT as string, 10);
  if (isNaN(port)) {
    throw new Error("Invalid port number.");
  }

  const credentials = {
    host: process.env.POSTGRES_HOST,
    port,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
  };
  return credentials;
};

const getOrCreatePool = async (): Promise<Pool> => {
  if (!pool) {
    const credentials = await getDatabaseCredentials();
    pool = new Pool(credentials);
  }
  return pool;
};

export { getOrCreatePool };
