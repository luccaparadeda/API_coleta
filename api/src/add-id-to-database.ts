import fs from 'fs';
import csv from 'csv-parser';
import { stringify } from 'csv-stringify/sync';

interface FireWatchData {
  data: string;
  municipio: string;
  estado: string;
  bioma: string;
  avg_numero_dias_sem_chuva: string;
  avg_precipitacao: string;
  avg_risco_fogo: string;
  avg_frp: string;
  id?: number;
}

const inputFile = 'Dataset_FireWatch_Brazil_Q1_2024.csv';
const outputFile = 'Dataset_FireWatch_Brazil_Q1_2024_with_id.csv';

const results: FireWatchData[] = [];

fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (data: FireWatchData) => results.push(data))
  .on('end', () => {
    const updatedResults = results.map((row, index) => ({
      id: index + 1,
      ...row
    }));

    const csvString = stringify(updatedResults, {
      header: true,
      columns: ['id', ...Object.keys(results[0])]
    });

    fs.writeFileSync(outputFile, csvString);
    console.log(`CSV file with added 'id' column has been created: ${outputFile}`);
  });