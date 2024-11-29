const express = require('express');
const axios = require('axios');

const app = express();
const port = 4000;

// Checklist rules
const checklistRules = [
  { id: 1, name: 'Valuation Fee Paid', condition: (data) => data.isValuationFeePaid === true },
  { id: 2, name: 'UK Resident', condition: (data) => data.isUkResident === true },
  { id: 3, name: 'Risk Rating Medium', condition: (data) => data.riskRating === 'Medium' },
  { id: 4, name: 'LTV Below 60%', condition: (data) => (data.loanRequired / data.purchasePrice) * 100 < 60 },
  { id: 5, name: 'Application Status Approved', condition: (data) => data.applicationStatus === 'Approved' },
];

// Fetch data from API
const fetchData = async () => {
  const API_URL =
    'http://qa-gb.api.dynamatix.com:3100/api/applications/getApplicationById/67339ae56d5231c1a2c63639';
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
};

// Evaluate checklist
const evaluateChecklist = async () => {
  const data = await fetchData();
  return checklistRules.map((rule) => ({
    id: rule.id,
    name: rule.name,
    status: rule.condition(data) ? 'Passed' : 'Failed',
  }));
};

// Serve the HTML page
app.get('/', async (req, res) => {
  const results = await evaluateChecklist();
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Checklist Dashboard</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          text-align: center;
        }
        h1 {
          color: #333;
        }
        table {
          margin: 20px auto;
          border-collapse: collapse;
          width: 80%;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 10px;
        }
        th {
          background-color: #007BFF;
        }
        td {
          text-align: center;
        }
        td.passed {
          background-color: #d4edda;
          color: #155724;
        }
        td.failed {
          background-color: #f8d7da;
          color: #721c24;
        }
      </style>
    </head>
    <body>
      <h1>Checklist System Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Rule ID</th>
            <th>Rule Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${results
            .map(
              (rule) => `
            <tr>
              <td>${rule.id}</td>
              <td>${rule.name}</td>
              <td class="${rule.status.toLowerCase()}">${rule.status}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
  res.send(html);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
