const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialwave';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    // Clear existing collections
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Notification.deleteMany({});

    console.log('Creating sample users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const usersData = [
      {
        firstName: 'Alex',
        lastName: 'Rivers',
        username: 'alexrivers',
        email: 'alex@example.com',
        password: hashedPassword,
        bio: 'Software engineer, open source lover, coffee enthusiast ☕️',
        location: 'San Francisco, CA',
        website: 'https://alexrivers.dev',
        isVerified: true,
      },
      {
        firstName: 'Sarah',
        lastName: 'Connor',
        username: 'sarahc',
        email: 'sarah@example.com',
        password: hashedPassword,
        bio: 'Designer & photographer capturing everyday moments 📸',
        location: 'New York, NY',
        website: 'https://sarahvisuals.com',
        isVerified: true,
      },
      {
        firstName: 'David',
        lastName: 'Kim',
        username: 'davidkim',
        email: 'david@example.com',
        password: hashedPassword,
        bio: 'Tech founder building the future of web apps 🚀',
        location: 'Seattle, WA',
        website: 'https://davidkim.io',
      },
      {
        firstName: 'Emma',
        lastName: 'Watson',
        username: 'emmawatson',
        email: 'emma@example.com',
        password: hashedPassword,
        bio: 'Literature student, book blogger, travel explorer 📚✨',
        location: 'London, UK',
      },
      {
        firstName: 'Marcus',
        lastName: 'Chen',
        username: 'marcusc',
        email: 'marcus@example.com',
        password: hashedPassword,
        bio: 'Full-stack developer working on distributed systems 💻',
        location: 'Toronto, Canada',
      },
    ];

    const users = await User.insertMany(usersData);
    console.log(`Created ${users.length} users.`);

    // Add friends
    const [alex, sarah, david, emma, marcus] = users;
    alex.friends = [sarah._id, david._id];
    sarah.friends = [alex._id, emma._id];
    david.friends = [alex._id, marcus._id];
    emma.friends = [sarah._id];
    marcus.friends = [david._id];

    await Promise.all([
      alex.save(),
      sarah.save(),
      david.save(),
      emma.save(),
      marcus.save(),
    ]);
    console.log('Friends connected.');

    // Create sample posts
    console.log('Creating sample posts...');
    const postsData = [
      {
        author: alex._id,
        content: 'Excited to announce that SocialWave is officially live! Built with modern full-stack technologies. Connect with your peers and let us know what you think! #tech #launch #socialwave',
        privacy: 'public',
        likes: [sarah._id, david._id, emma._id],
        hashtags: ['tech', 'launch', 'socialwave'],
        comments: [
          {
            author: sarah._id,
            content: 'Congratulations Alex! The UI looks super clean and responsive.',
            likes: [alex._id],
            createdAt: new Date(),
          },
          {
            author: david._id,
            content: 'Awesome job team! Ready to test all the features.',
            likes: [],
            createdAt: new Date(),
          },
        ],
      },
      {
        author: sarah._id,
        content: 'Beautiful sunset in Brooklyn tonight. Moments like these remind us to pause and reflect. 🌅 #photography #sunset #peace',
        privacy: 'public',
        likes: [alex._id, emma._id],
        hashtags: ['photography', 'sunset', 'peace'],
      },
      {
        author: david._id,
        content: 'Working on scaling real-time web architectures today. Clean code, proper database indexing, and great APIs make all the difference. #softwaredevelopment #coding',
        privacy: 'public',
        likes: [alex._id, marcus._id],
        hashtags: ['softwaredevelopment', 'coding'],
      },
      {
        author: emma._id,
        content: 'Currently reading "Clean Architecture" by Robert C. Martin. Highly recommended for every developer out there! 📖 #books #architecture',
        privacy: 'public',
        likes: [alex._id, sarah._id],
        hashtags: ['books', 'architecture'],
      },
      {
        author: marcus._id,
        content: 'Happy to connect with everyone here. Drop a comment if you love building full-stack applications! #developer #community',
        privacy: 'public',
        likes: [david._id],
        hashtags: ['developer', 'community'],
      },
    ];

    await Post.insertMany(postsData);
    console.log(`Created ${postsData.length} sample posts.`);

    // Notifications
    const notificationsData = [
      {
        recipient: alex._id,
        sender: sarah._id,
        type: 'like',
        message: 'liked your post',
        isRead: false,
      },
      {
        recipient: alex._id,
        sender: david._id,
        type: 'comment',
        message: 'commented on your post',
        isRead: false,
      },
    ];

    await Notification.insertMany(notificationsData);
    console.log('Sample notifications created.');

    console.log('\n--- SEED COMPLETE ---');
    console.log('Default credentials for all users:');
    console.log('Password: password123');
    console.log('Users: alex@example.com, sarah@example.com, david@example.com, emma@example.com, marcus@example.com');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
