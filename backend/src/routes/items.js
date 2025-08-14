const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (intentionally sync to highlight blocking issue)
async function readData() {
  return new Promise((resolve, reject) => {
    fs.readFile(DATA_PATH, 'utf8', (err, raw) => {
      if (err) return reject(err);
      try {
        const data = JSON.parse(raw);
        resolve(data);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const rawData = await readData();
    const q = (req.query.q || '').toString();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const filtered = rawData.filter(item =>
      item.name.toLowerCase().includes(q.toLowerCase())
    );

    const paginated = filtered.slice(offset, offset + limit);

    console.log(filtered, paginated)

    res.json({
      total: filtered.length,
      page,
      limit,
      items: paginated
    });
  } catch (err) {
    next(err);
  }
});


// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = await readData();
    item.id = Date.now();
    data.push(item);
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;