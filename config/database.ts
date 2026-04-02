export default ({ env }) => ({
  connection: {
    client: "postgres",
    connection: env("DATABASE_URL"),
    pool: {
      min: env.int("DATABASE_POOL_MIN", 2),
      max: env.int("DATABASE_POOL_MAX", 10),
    },
  },
});
