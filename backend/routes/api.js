const express = require('express');
const router = express.Router();
const Traffic = require("../models/Traffic");
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;

// Import all data from your actual mockData.js
const {
    trafficData,
    vehicles,
    stats,
    parkingZones,
    deliveries,
    weatherClimate
} = require('../data/mockData');

/**
 * 1. AGGREGATE ENDPOINT (The one you asked about)
 * Specifically for the PresentationFrame / Intro Page
 */
router.get('/dashboard-stats', (req, res) => {
    res.json({
        stats: stats,
        vehicles: vehicles,
        parkingZones: parkingZones
    });
});

/**
 * 2. INDIVIDUAL ENDPOINTS
 * Required for the other pages in your project
 */
router.get('/traffic', async (req, res) => {
    try {
        const traffic = await Traffic.find();
        res.json(traffic);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});
router.post("/traffic", async (req,res)=>{
  try{
    const newTraffic = new Traffic(req.body);
    await newTraffic.save();
    res.json(newTraffic);
  }catch(err){
    res.status(500).json({error:err.message});
  }
});

router.get('/vehicles', (req, res) => {
    res.json(vehicles);
});

router.get('/stats', (req, res) => {
    res.json(stats);
});

router.get('/parking-zones', (req, res) => {
    res.json(parkingZones);
});

router.get('/deliveries', (req, res) => {
    res.json(deliveries);
});

router.get('/weather-climate', (req, res) => {
    res.json(weatherClimate);
});

router.get("/download-traffic-csv", async (req,res)=>{
  try{

    const data = await Traffic.find().lean();

    const csvWriter = createCsvWriter({
      header:[
        {id:"location",title:"Location"},
        {id:"vehicles",title:"Vehicles"},
        {id:"congestionLevel",title:"Congestion"},
        {id:"time",title:"Time"}
      ]
    });

    const csv =
      csvWriter.getHeaderString() +
      csvWriter.stringifyRecords(data);

    res.header("Content-Type","text/csv");
    res.attachment("traffic-data.csv");
    res.send(csv);

  }catch(err){
    res.status(500).json({error:err.message});
  }
});

module.exports = router;