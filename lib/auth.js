const { connectDB } = require('./db');

async function authenticate(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = await connectDB();
    const user = await db.collection('users').findOne({ _id: require('mongodb').ObjectId(userId) });
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { authenticate };
