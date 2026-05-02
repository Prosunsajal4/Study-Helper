const { connectDB } = require('../../../lib/db');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await connectDB();
    const { subjectId, documentId } = req.query;
    const ObjectId = require('mongodb').ObjectId;
    
    let query = {};
    if (subjectId) {
      query.subjectId = new ObjectId(subjectId);
    }
    if (documentId) {
      query.documentId = new ObjectId(documentId);
    }
    
    const patterns = await db.collection('questionPatterns')
      .find(query)
      .sort({ updatedAt: -1 })
      .toArray();
    
    res.status(200).json(patterns);
  } catch (error) {
    console.error('Question patterns API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
