module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "test",
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://MikeDent@localhost/nbafantasy',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://MikeDent@localhost/nbafantasytest',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
};
