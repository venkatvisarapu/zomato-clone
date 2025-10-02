const express = require("express");
const router = express.Router();
const Country = require("../models/Country");


router.get("/", async (req, res) => {
  try {
    const countries = await Country.find();
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/:code", async (req, res) => {
  try {
    const country = await Country.findOne({ CountryCode: req.params.code });
    if (!country) return res.status(404).json({ error: "Country not found" });
    res.json(country);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
