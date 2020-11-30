const express = require('express');
const router = express.Router();
const parkScraper = require('./../scraper/index.js');


  router.get('/baseParksData', function (req, res) {
    parkScraper.fetchAllParksBaseData();
    res.send('GET fetchAllParksBaseData')
  });


  router.get('/test/updatePark/:parkId', function (req, res) {
    parkScraper.getReservationInfo(req.params.parkId);
    res.send('GET getReservationInfo')
  });

module.exports = router;