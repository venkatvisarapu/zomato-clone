require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Restaurant = require("../models/Restaurant");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Configure Multer for Image Uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ✅ Route to Analyze Food Image and Fetch Restaurants
router.post("/search", upload.single("foodImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload an image" });
    }

    // ✅ Convert image to base64
    const base64Image = req.file.buffer.toString("base64");

    // ✅ Use Updated Gemini 1.5 Model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });  // 🔥 Updated model
    const result = await model.generateContent({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",  // Adjust based on actual file type
                data: base64Image,
              },
            },
            {
              text: "Identify the food items in this image. List common names like 'Biryani, Soup, Noodles, Pizza, Burger'.",
            },
          ],
        },
      ],
    });

    const response = await result.response.text();
    console.log("🔍 AI Response:", response);

    // ✅ Extract food names using regex
    const detectedFoods = response.match(/(Biryani|Soup|Noodles|Pizza|Burger|Pasta|Dosa|Fries|Salad|Ice Cream)/gi) || [];
    if (detectedFoods.length === 0) {
      return res.status(404).json({ error: "Food item not recognized." });
    }

    console.log("🍽️ Detected Foods:", detectedFoods);

    // ✅ Find restaurants that offer these foods
    const foodQuery = detectedFoods.map(food => new RegExp(food, "i"));
    const restaurants = await Restaurant.find({ Cuisines: { $in: foodQuery } });

    res.json({ detectedFoods, restaurants });
  } catch (error) {
    console.error("❌ Error processing image:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
