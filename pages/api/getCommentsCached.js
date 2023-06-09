import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Assuming data.json is in the root directory
      const filePath = path.join(process.cwd(), 'data.json'); 
      const fileData = fs.readFileSync(filePath, 'utf8');

      const data = JSON.parse(fileData);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  } else {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
  }
}