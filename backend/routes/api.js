const express = require('express');
const router = express.Router();
const Delivery = require("../models/Delivery"); 
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;

// Shared memory for activity logs (Captures your clicks in real-time)
let userActivityLogs = [];

/**
 * 1. GET ALL PENDING DELIVERIES
 * Purpose: Feeds the Priority Panel and Driver App.
 * URL: https://margdarshak-4.onrender.com/api/deliveries
 */
router.get('/deliveries', async (req, res) => {
    try {
        // Fetches orders that aren't 'Completed' to show live progress
        const data = await Delivery.find({ status: { $ne: 'Completed' } }); 
        res.status(200).json(data);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ error: "Database fetch failed" });
    }
});

/**
 * 2. CONFIRM ARRIVAL (The Sync Trigger)
 * Purpose: Triggered by the "Confirm Arrival" button in Driver App.
 * URL: https://margdarshak-4.onrender.com/api/delivery/confirm
 */
router.post('/delivery/confirm', async (req, res) => {
    const { orderId, driverName } = req.body;

    if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
    }

    try {
        // 1. Update status in MongoDB
        const updated = await Delivery.findOneAndUpdate(
            { orderId: orderId }, 
            { status: 'Completed' },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: "Order not found in Database" });
        }

        // 2. Log the activity for the CSV Export
        const logEntry = {
            user: driverName || "Ankit",
            action: "ARRIVED & CONFIRMED",
            order: orderId,
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        };

        userActivityLogs.push(logEntry);
        console.log("Activity Captured:", logEntry);

        res.status(200).json({ 
            success: true, 
            message: `Order ${orderId} confirmed successfully.`,
            currentLogs: userActivityLogs.length 
        });
    } catch (err) {
        console.error("Confirmation Error:", err);
        res.status(500).json({ error: "Server sync failed" });
    }
});

/**
 * 3. DOWNLOAD ACTIVITY CSV
 * Purpose: Exports the audit trail of confirmed deliveries.
 * URL: https://margdarshak-4.onrender.com/api/download-activity-csv
 */
router.get("/download-activity-csv", (req, res) => {
    try {
        const csvWriter = createCsvWriter({
            header: [
                { id: "user", title: "Operator" },
                { id: "action", title: "Action" },
                { id: "order", title: "Order ID" },
                { id: "timestamp", title: "Time (IST)" }
            ]
        });

        // Use recorded logs, or a system placeholder if empty
        const records = userActivityLogs.length > 0 
            ? userActivityLogs 
            : [{ user: "System", action: "No activity yet", order: "N/A", timestamp: "N/A" }];

        const csvString = csvWriter.getHeaderString() + csvWriter.stringifyRecords(records);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=Ankit_MargDarshak_Activity.csv");
        
        res.status(200).send(csvString);
    } catch (err) {
        console.error("CSV Generation Error:", err);
        res.status(500).send("Failed to generate CSV");
    }
});

/**
 * 4. DEMO RESET (The "Force-Fix" Version)
 * URL: https://margdarshak-4.onrender.com/api/demo/reset
 */
router.get('/demo/reset', async (req, res) => {
    try {
        // This ensures EVERY document gets the 'Pending' status
        const result = await Delivery.updateMany({}, { 
            $set: { status: 'Pending' } 
        });
        
        userActivityLogs = []; // Clear the CSV logs
        
        console.log(`Reset successful. Updated ${result.modifiedCount} orders.`);
        
        res.status(200).send(`
            <div style="font-family: sans-serif; padding: 40px; text-align: center; background: #0B0F1A; color: white; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <h1 style="color: #0EA5E9; font-size: 3rem;">🚀 System Re-Energized</h1>
                <p style="font-size: 1.2rem; color: #94A3B8;">MongoDB updated: ${result.modifiedCount} orders are now Pending.</p>
                <p style="color: #64748B;">Refresh your app to see the fleet return to action.</p>
                <a href="https://margdarshak-ui.vercel.app" style="margin-top: 20px; text-decoration: none; background: #0EA5E9; color: white; padding: 12px 24px; border-radius: 8px; font-weight: bold;">Back to App</a>
            </div>
        `);
    } catch (err) {
        res.status(500).send("Reset failed: " + err.message);
    }
});

module.exports = router;