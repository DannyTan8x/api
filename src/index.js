// index.js
// This is the main entry point of our application
require('dotenv').config();

const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Hello Node Server!!'));

app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
