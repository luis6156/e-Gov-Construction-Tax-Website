import express, { Express, Request, Response } from 'express';
import fs from 'fs';

const app: Express = express();

let geoJsonData: any = null;

// Read the geo-data.json file at startup
fs.readFile('../data/geo-data.json', (err, data) => {
  if (err) {
    console.error('Error reading JSON file: ', err);
    return;
  } else {
    try {
      geoJsonData = JSON.parse(data.toString());
      console.log('JSON data parsed successfully!');
    } catch (err) {
      console.error('Error parsing JSON data: ', err);
    }
  }
});

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

app.get('/api/counties', (_, res: Response) => {
  if (!geoJsonData) {
    res.status(500).send('No geographical data available');
    return;
  } else {
    res.json(geoJsonData.counties);
  }
});

app.get('/api/institutions/:countyId', (req, res: Response) => {
  const countyId = parseInt(req.params.countyId, 10); // Parse the parameter to an integer

  if (
    isNaN(countyId) ||
    countyId < 0 ||
    countyId >= geoJsonData.countyInstitutions.length
  ) {
    res.status(400).json({ error: 'Invalid or out-of-range countyId' });
    return;
  }

  if (geoJsonData.countyInstitutions[countyId] === undefined) {
    res
      .status(404)
      .json({ error: 'No institutions available for this county' });
    return;
  } else {
    res.json(geoJsonData.countyInstitutions[countyId]);
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
