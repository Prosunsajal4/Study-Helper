const { connectDB } = require('../../lib/db');
const { ObjectId } = require('mongodb');

export default async function handler(req, res) {
  try {
    const db = await connectDB();
    
    if (req.method === 'GET') {
      const { id } = req.query;
      if (id) {
        let subject;
        try {
          subject = await db.collection('subjects').findOne({ _id: new ObjectId(String(id)) });
        } catch {
          return res.status(400).json({ error: 'Invalid subject id' });
        }
        if (!subject) {
          return res.status(404).json({ error: 'Subject not found' });
        }
        return res.status(200).json(subject);
      }
      const subjects = await db.collection('subjects').find({}).sort({ createdAt: -1 }).toArray();
      res.status(200).json(subjects);
    } else if (req.method === 'POST') {
      const { name, code } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Subject name is required' });
      }
      
      const subject = {
        name,
        code: code || '',
        createdAt: new Date()
      };
      
      const result = await db.collection('subjects').insertOne(subject);
      subject._id = result.insertedId;
      
      res.status(201).json(subject);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Subjects API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
