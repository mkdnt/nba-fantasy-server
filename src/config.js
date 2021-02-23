module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://iggywewzjgjjfm:88fa1a2fd5f051dc5011976122bfe3be117c66713540577d9ff56020c611305f@ec2-54-90-55-211.compute-1.amazonaws.com:5432/d3toaevshop0hn',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://MikeDent@localhost/nbafantasytest',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'https://full-court.vercel.app/',
  JWT_SECRET: process.env.JWT_SECRET || '12ce3b7c-f88c-4732-922d-b390fd154248',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '3h'
};
