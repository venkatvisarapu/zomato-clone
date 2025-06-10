const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
  RestaurantId: { type: Number, unique: true, required: true },
  Name: String,
  Cuisines: String,
  AverageCost: Number,
  Currency: String,
  Rating: Number,
  Votes: Number,
  Location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    Address: String,
    City: String,
  },
  HasOnlineDelivery: Boolean,
  HasTableBooking: Boolean,
  PriceRange: Number,
  FeaturedImage: String,
  MenuURL: String,
  PhotosURL: String,
  ZomatoEvents: [
    {
      EventID: Number,
      Title: String,
      Description: String,
      StartDate: String,
      EndDate: String,
      Photos: [String]
    }
  ]
});

// ✨ IMPROVEMENT: Add a 2dsphere index for efficient geospatial queries.
RestaurantSchema.index({ "Location": "2dsphere" });

module.exports = mongoose.model("Restaurant", RestaurantSchema);