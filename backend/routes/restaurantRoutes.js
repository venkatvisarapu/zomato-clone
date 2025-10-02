const express = require("express");
const router = express.Router();
const Restaurant = require("../models/Restaurant");


router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    let filter = {};

    if (query) {
      filter = {
        $or: [
          { Name: { $regex: query, $options: "i" } },
          { Cuisines: { $regex: query, $options: "i" } },
          { "Location.City": { $regex: query, $options: "i" } },
        ],
      };
    }

    const restaurants = await Restaurant.find(filter).limit(50);
    res.json({ total: restaurants.length, restaurants });
  } catch (error) {
    res.status(500).json({ error: "Server error during search" });
  }
});


router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, range } = req.query;

    if (!lat || !lng || !range) {
      return res.status(400).json({ error: "Latitude, longitude, and range are required." });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxDistance = parseFloat(range) * 1000;

    const restaurants = await Restaurant.find({
      Location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [userLng, userLat],
          },
          $maxDistance: maxDistance,
        },
      },
    });

    console.log(`✅ Found ${restaurants.length} restaurants within ${range}km.`);
    res.json(restaurants);
  } catch (error)
  {
    console.error("❌ Backend Error in /nearby:", error);
    res.status(500).json({ error: "Server error while finding nearby restaurants." });
  }
});


router.get("/", async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 12; 
    const skip = (page - 1) * limit;

    const restaurants = await Restaurant.find().skip(skip).limit(limit);
    const totalRestaurants = await Restaurant.countDocuments();

    res.json({
      totalRestaurants,
      page,
      totalPages: Math.ceil(totalRestaurants / limit),
      restaurants,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching restaurants" });
  }
});


router.get("/:id", async (req, res) => {
  try {
    if (isNaN(req.params.id)) {
      return res.status(400).json({ error: "Invalid Restaurant ID format." });
    }

    const restaurant = await Restaurant.findOne({ RestaurantId: req.params.id });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching restaurant details." });
  }
});

module.exports = router;