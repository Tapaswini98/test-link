const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

const CACHE_TTL = 60 * 1000; // 1 minute TTL

let cachedStats = null;
let lastComputed = 0;

// Watch file changes to invalidate cache
fs.watch(DATA_PATH, () => {
  cachedStats = null;
  console.log('Data file changed, cache invalidated.');
});

function computeStats(items) {
  return {
    total: items.length,
    averagePrice: items.reduce((acc, cur) => acc + cur.price, 0) / items.length
  };
}

function getStats(callback) {
  const now = Date.now();

  // Return cached stats if still valid
  if (cachedStats && now - lastComputed < CACHE_TTL) {
    return callback(null, cachedStats);
  }

  // Recompute stats
  fs.readFile(DATA_PATH, (err, raw) => {
    if (err) return callback(err);

    try {
      const items = JSON.parse(raw);
      cachedStats = computeStats(items);
      lastComputed = now;
      callback(null, cachedStats);
    } catch (parseErr) {
      callback(parseErr);
    }
  });
}

router.get('/', (req, res, next) => {
  getStats((err, stats) => {
    if (err) return next(err);
    res.json(stats);
  });
});

module.exports = router;