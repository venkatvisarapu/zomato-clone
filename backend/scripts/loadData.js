const mongoose = require('mongoose');
const fs =require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const Restaurant = require("../models/Restaurant");

const mongoURI = process.env.MONGO_URI;

const loadData = async () => {
  try {
    await mongoose.connect(mongoURI, {});
    console.log("✅ MongoDB Connected for data loading.");

    await Restaurant.deleteMany({});
    console.log("🗑️ Cleared existing restaurant data.");

    let allData = [];
    const jsonFiles = ["file1.json", "file2.json", "file3.json", "file4.json", "file5.json"];

    for (const file of jsonFiles) {
      console.log(`📂 Processing ${file}...`);
      const filePath = path.join(__dirname, 'data', file);
      const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (Array.isArray(rawData)) {
        rawData.forEach((entry) => {
          if (entry.restaurants) {
            const jsonData = entry.restaurants.map(r => ({
              RestaurantId: r.restaurant.R.res_id,
              Name: r.restaurant.name || "Unknown",
              Cuisines: r.restaurant.cuisines || "Not Specified",
              AverageCost: r.restaurant.average_cost_for_two || 0,
              Currency: r.restaurant.currency || "Unknown",
              Rating: parseFloat(r.restaurant.user_rating?.aggregate_rating) || 0,
              Votes: parseInt(r.restaurant.user_rating?.votes, 10) || 0,
              Location: {
                type: 'Point',
                coordinates: [
                  parseFloat(r.restaurant.location?.longitude) || 0,
                  parseFloat(r.restaurant.location?.latitude) || 0,
                ],
                Address: r.restaurant.location?.address || "No Address",
                City: r.restaurant.location?.city || "Unknown City",
              },
              HasOnlineDelivery: r.restaurant.has_online_delivery === 1,
              HasTableBooking: r.restaurant.has_table_booking === 1,
              PriceRange: r.restaurant.price_range || 0,
              FeaturedImage: r.restaurant.featured_image || "",
              MenuURL: r.restaurant.menu_url || "#",
              PhotosURL: r.restaurant.photos_url || "#",
              ZomatoEvents: r.restaurant.zomato_events ? r.restaurant.zomato_events.map(e => ({
                EventID: e.event.event_id,
                Title: e.event.title,
                Description: e.event.description,
                StartDate: e.event.start_date,
                EndDate: e.event.end_date,
                Photos: e.event.photos?.map(p => p.photo.url) || []
              })) : []
            }));
            allData = allData.concat(jsonData);
          }
        });
      }
    }
    
    
    const uniqueData = Array.from(new Map(allData.map(item => [item.RestaurantId, item])).values());

    await Restaurant.insertMany(uniqueData);
    console.log(`✅ Successfully Inserted ${uniqueData.length} unique restaurants!`);

  } catch (err) {
    console.error("❌ Data Insertion Error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

loadData();