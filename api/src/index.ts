import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import csv from 'csv-parser';
import { stringify } from 'csv-stringify/sync';

const app = express();
app.use(bodyParser.json());

const CSV_FILE_PATH = 'Dataset_FireWatch_Brazil_Q1_2024_with_id.csv';

interface Data {
  id: string;
  [key: string]: string;
}

let dataset: Data[] = [];

const loadDataset = async () => {
  const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8');
  return new Promise<void>((resolve) => {
    const results: Data[] = [];
    const parser = csv();
    parser.on('data', (data: Data) => results.push(data));
    parser.on('end', () => {
      dataset = results;
      console.log('Dataset carregado com sucesso');
      resolve();
    });
    parser.write(fileContent);
    parser.end();
  });
};

const saveDataset = async () => {
  const csvString = stringify(dataset, { header: true });
  await fs.writeFile(CSV_FILE_PATH, csvString);
  console.log('Dataset salvo com sucesso');
};

const initializeApp = async () => {
  await loadDataset();

  app.get('/api/data', (req: Request, res: Response) => {
    const { limit } = req.query;
    const n = limit ? parseInt(limit as string) : 10;
    res.json(dataset.slice(0, n));
  });

  app.get('/api/data/:field/:value', (req: Request, res: Response) => {
    const { field, value } = req.params;
    const results = dataset.filter(item => item[field] === value);
    res.json(results);
  });

  app.post('/api/data/filter', (req: Request, res: Response) => {
    const filters = req.body;
    const results = dataset.filter(item => {
      return Object.keys(filters).every(key => item[key] === filters[key]);
    });
    res.json(results);
  });

  app.post('/api/data', async (req: Request, res: Response) => {
    const newData: Data = req.body;
    newData.id = (dataset.length + 1).toString(); // Assuming id is a string
    dataset.push(newData);
    await saveDataset();
    res.status(201).json(newData);
  });

  app.put('/api/data/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedData = req.body;
    const index = dataset.findIndex(item => item.id === id);
    if (index !== -1) {
      dataset[index] = { ...dataset[index], ...updatedData };
      await saveDataset();
      res.json(dataset[index]);
    } else {
      res.status(404).json({ message: 'Dado não encontrado' });
    }
  });

  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
  })

  app.delete('/api/data/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const index = dataset.findIndex(item => item.id === id);
    if (index !== -1) {
      const deletedData = dataset.splice(index, 1);
      await saveDataset();
      res.json(deletedData);
    } else {
      res.status(404).json({ message: 'Dado não encontrado' });
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
};

initializeApp().catch(console.error);