module.exports = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://psvayhcdjwycnb:cc4ffb7688bfca6e49eec0c5b2e5cd3f01ae9f7269e03ca4ad43e992ef0716e9@ec2-54-164-238-108.compute-1.amazonaws.com:5432/dco0pr789vq01b',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://MikeDent@localhost/nbafantasytest',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'https://full-court.vercel.app',
  JWT_SECRET: process.env.JWT_SECRET || '12ce3b7c-f88c-4732-922d-b390fd154248',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '3h'
};