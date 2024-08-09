
// import fs from 'fs';
// import { createObjectCsvWriter } from 'csv-writer';

// export const generateCSV = async (categories, filePath) => {
//   try {
//     const csvWriter = createObjectCsvWriter({
//       path: filePath,
//       header: [
//         { id: 'name', title: 'Name' },
//         { id: 'description', title: 'Description' },
//         // Add more headers if needed
//       ]
//     });

//     const records = categories.map(category => ({
//       name: category.name,
//       description: category.description,
//       // Map more fields if needed
//     }));

//     await csvWriter.writeRecords(records);
//     console.log('CSV file was written successfully');
//   } catch (error) {
//     console.error('Error writing CSV file:', error);
//     throw error;
//   }
// };

import fs from 'fs';
import { parse } from 'json2csv';

export const generateCSV = async (categories, filePath) => {
  try {
    // Check if categories is an array
    if (!Array.isArray(categories)) {
      throw new TypeError('Categories is not an array');
    }

    // generate CSV
    const csv = parse(categories);
    fs.writeFileSync(filePath, csv);
    console.log('CSV file written successfully');
  } catch (error) {
    console.error('Error writing CSV file:', error.message);
    throw error;
  }
};


