import { doc, getDoc } from '@firebase/firestore';
import express, { Request, Response } from 'express';

import db from '../utils/firebase.js';

const app = express();

// Handling CORS
app.use((_, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.get('/api/message', (_, res: Response) => {
  res.json({ message: 'Hello API!' });
});

app.get('/api/institutions/:countyId', async (req, res: Response) => {
  const countyId = parseInt(req.params.countyId, 10);

  try {
    const docRef = doc(db, 'countyInstitutions', countyId.toString());
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const resInstitutions = docSnap.data().institutions;
      res.json(resInstitutions);
    } else {
      console.log('No documents found in the "institutions" collection.');
      res.status(404).json({ error: 'No institutions available' });
    }
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
    res.status(500).json({ error: 'Error fetching data from Firestore' });
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
