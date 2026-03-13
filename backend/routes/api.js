const express = require('express');
const router = express.Router();

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
router.get('/traffic', (req, res) => {
    res.json(trafficData);
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

module.exports = router;