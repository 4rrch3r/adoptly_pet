const mongoose = require('mongoose');

const setupTestDB = () => {
  beforeAll(async () => {
    let mongoDbUrl = process.env.MONGODB_URL;
    mongoDbUrl += process.env.NODE_ENV=='test'?'-test':'';
    await mongoose.connect(mongoDbUrl);
  });

  beforeEach(async () => {
    await Promise.all(Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany()));
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
};

module.exports = setupTestDB;
