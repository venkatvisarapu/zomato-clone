const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Restaurant = require("../models/Restaurant");

const router = express.Router();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/search", upload.single("foodImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload an image" });
    }

    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt =
      "Analyze the food in this image. Return a comma-separated list of the primary dishes you see (e.g., Pizza, Salad, Fries). If no food is identifiable, return an empty response.";

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    
    const result = await model.generateContent([
      { text: prompt },
      imagePart,
    ]);

    const aiResponseText = result.response.text();
    console.log("🔍 AI Response:", aiResponseText);

    const detectedFoods = aiResponseText
      .split(",")
      .map((food) => food.trim())
      .filter(Boolean);

    if (detectedFoods.length === 0) {
      return res
        .status(404)
        .json({ error: "Could not identify any food items in the image." });
    }

    console.log("🍽️ Detected Foods:", detectedFoods);

    const foodQuery = detectedFoods.map((food) => new RegExp(food, "i"));
    const restaurants = await Restaurant.find({
      Cuisines: { $in: foodQuery },
    });

    res.json({ detectedFoods, restaurants });
  } catch (error) {
    console.error("❌ Error processing image:", error);
    res
      .status(500)
      .json({
        error:
          "An unexpected server error occurred during image analysis.",
      });
  }
});

module.exports = router;
