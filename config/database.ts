import path from "path";

export default ({ env }) => {
  const client = env("DATABASE_CLIENT", "sqlite");

  const connections = {
    sqlite: {
      connection: {
        filename: path.resolve(process.cwd(), env("DATABASE_FILENAME", ".tmp/data.db")),
      },
      useNullAsDefault: true,
    },
    postgres: {
      connection: env("DATABASE_URL"),
      pool: {
        min: env.int("DATABASE_POOL_MIN", 2),
        max: env.int("DATABASE_POOL_MAX", 10),
      },
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
    },
  };
};
