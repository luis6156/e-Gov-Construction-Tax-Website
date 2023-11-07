import { doc, getDoc } from '@firebase/firestore';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

import db from '../utils/firebase.js';
import { timeStamp } from 'console';
import { addDoc, collection, setDoc } from 'firebase/firestore';

const app = express();

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

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

app.get('/api/institutions/:countyId', async (req: Request, res: Response) => {
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

app.post('/api/total', jsonParser, (req: Request, res: Response) => {
  const { type, value } = req.body;

  if (type === undefined || value === undefined) {
    res.status(400).json({ error: 'Missing required parameters' });
  }

  console.log(`type: ${type}, value: ${value}`);

  let total = 0;

  if (type === 'create-residential') {
    total = value * 0.005;
  } else if (type === 'create-commercial') {
    total = value * 0.01;
  } else if (type === 'renewal') {
    total = value * 0.3;
  } else {
    res.status(400).json({ error: 'Invalid type' });
    return;
  }

  total = parseFloat(total.toFixed(2));

  res.json({ total });
});

app.post('/api/submit', jsonParser, (req: Request, res: Response) => {
  const data = req.body;

  const { taxType, totalToPay, authorizedValue } = data.form;

  console.log(taxType, totalToPay, authorizedValue);

  let message = '';

  if (
    taxType === 'create-residential' &&
    totalToPay === authorizedValue * 0.005
  ) {
    message = 'Valid';
  } else if (
    taxType === 'create-commercial' &&
    totalToPay === authorizedValue * 0.01
  ) {
    message = 'Valid';
  } else if (taxType === 'renewal' && totalToPay === authorizedValue * 0.3) {
    message = 'Valid';
  } else {
    message = 'Invalid total';
  }

  if (message === 'Valid') {
    setDoc(
      doc(
        db,
        'taxes',
        Date.now().toString() + '_' + data.form.recipientNameOrBusiness
      ),
      data
    );

    res.json({ message });
  } else {
    res.status(400).json({ message });
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
