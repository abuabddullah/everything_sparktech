const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../modules/User/user.model');
const VapingInfo = require('../modules/VapingInfo/vapingInfo.model');
const VapeStatistics = require('../modules/VapeStatistics/vapeStatistics.model');
const BreathingStatistics = require('../modules/BreathingStatistics/breathingStatistics.model');
const Subscription = require('../modules/Subscription/subscription.model');

// Sample demo data for users (with the provided user ID)
const usersData = [
  {
    _id: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a25"), // Provided user ID
    fullName: 'Shakib Ahmed',
    email: 'shakib@example.com',
    password: 'Shakib@123', // Use bcrypt for encryption in your model if needed
    role: 'user',
    image: '/uploads/users/user.jpg'
  },
  {
    _id: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a26"), // Another user for variation
    fullName: 'Sara Khan',
    email: 'sara@example.com',
    password: 'Sara@123',
    role: 'user',
    image: '/uploads/users/sara.jpg'
  }
];

// Sample demo data for VapingInfo model with more competitive values
const vapingInfoData = [
  {
    user: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a25"),
    noOfVapePerDay: 30, // Increased number of vapes per day for more competitive scenario
    investPerMonth: 200, // Higher monthly investment
    noOfMlPerVape: 0.7, // Each vape is 0.7ml
    triedQuitBefore: true,
    isForManagingStress: true,
    deviceCapacityInML: 3 // Larger device capacity
  },
  {
    user: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a26"),
    noOfVapePerDay: 20, // Moderate vaping frequency
    investPerMonth: 150, // Reasonable monthly investment
    noOfMlPerVape: 0.6,
    triedQuitBefore: false,
    isForManagingStress: false,
    deviceCapacityInML: 2.5
  }
];

// Sample demo data for VapeStatistics model with more variation
const vapeStatisticsData = [
  {
    user: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a25"),
    date: new Date('2024-11-01')
  },
  {
    user: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a25"),
    date: new Date('2024-11-02')
  },
  {
    user: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a25"),
    date: new Date('2024-11-03')
  },
  {
    user: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a26"),
    date: new Date('2024-11-01')
  },
  {
    user: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a26"),
    date: new Date('2024-11-02')
  },
  {
    user: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a26"),
    date: new Date('2024-11-03')
  }
];

// Sample demo data for BreathingStatistics model with varied durations
const breathingStatisticsData = [
  {
    user: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a25"),
    date: new Date('2024-11-01'),
    duration: 10 // 10 minutes
  },
  {
    user: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a25"),
    date: new Date('2024-11-02'),
    duration: 15 // 15 minutes
  },
  {
    user: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a25"),
    date: new Date('2024-11-03'),
    duration: 20 // 20 minutes
  },
  {
    user: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a26"),
    date: new Date('2024-11-01'),
    duration: 5 // 5 minutes for a less competitive user
  },
  {
    user: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a26"),
    date: new Date('2024-11-02'),
    duration: 10 // 10 minutes
  },
  {
    user: new mongoose.Types.ObjectId("672df665d8413c73e3cb1a26"),
    date: new Date('2024-11-03'),
    duration: 12 // 12 minutes
  }
];

const subscriptionData = [
  {
    name: 'Basic',
    price: 0,
    duration: 0,
    maxVapesPerDay: 30
  },
  {
    name: 'Premium',
    price: 20,
    duration: 1,
    maxVapesPerDay: 200
  }
];


// Function to drop the entire database
const dropDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    console.log('------------> Database dropped successfully! <------------');
  } catch (err) {
    console.error('Error dropping database:', err);
  }
};

// Function to seed users
const seedUsers = async () => {
  try {
    await User.deleteMany();
    await User.insertMany(usersData);
    console.log('Users seeded successfully!');
  } catch (err) {
    console.error('Error seeding users:', err);
  }
};

// Function to seed vaping data
const seedVapingData = async () => {
  try {
    await VapingInfo.deleteMany();
    await VapingInfo.insertMany(vapingInfoData);
    console.log('Vaping Info seeded successfully!');
  } catch (err) {
    console.error('Error seeding vaping info:', err);
  }
};

// Function to seed vape statistics
const seedVapeStatistics = async () => {
  try {
    await VapeStatistics.deleteMany();
    await VapeStatistics.insertMany(vapeStatisticsData);
    console.log('Vape Statistics seeded successfully!');
  } catch (err) {
    console.error('Error seeding vape statistics:', err);
  }
};

// Function to seed breathing statistics
const seedBreathingStatistics = async () => {
  try {
    await BreathingStatistics.deleteMany();
    await BreathingStatistics.insertMany(breathingStatisticsData);
    console.log('Breathing Statistics seeded successfully!');
  } catch (err) {
    console.error('Error seeding breathing statistics:', err);
  }
};

// Function to seed subscriptions
const seedSubscriptions = async () => {
  try {
    await Subscription.deleteMany();
    await Subscription.insertMany(subscriptionData);
    console.log('Subscriptions seeded successfully!');
  } catch (err) {
    console.error('Error seeding subscriptions:', err);
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_CONNECTION);

// Call seeding functions
const seedDatabase = async () => {
  try {
    // Clear the database
    await dropDatabase();

    // Seed all the necessary data
    await seedUsers();
    await seedVapingData();
    await seedVapeStatistics();
    await seedBreathingStatistics();
    await seedSubscriptions();

    console.log('--------------> Database seeding completed <--------------');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect();
  }
};

// Execute seeding
seedDatabase();
