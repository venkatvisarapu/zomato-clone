import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../apiConfig";
const ImageSearch = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [detectedFoods, setDetectedFoods] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSearch = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setError("");
    setLoading(true);
    setRestaurants([]);
    setDetectedFoods([]);

    const formData = new FormData();
    formData.append("foodImage", file);

    try {
      const response = await axios.post(`${API_BASE_URL}/image/search`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDetectedFoods(response.data.detectedFoods);
      setRestaurants(response.data.restaurants);
      if (response.data.restaurants.length === 0) {
        setError("No restaurants found serving the detected food items.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during the search.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>📸 Find Restaurants by Food Image</h2>
        <p>Upload a picture of food, and we'll find restaurants that serve it!</p>
      </div>

      <div className="search-form">
        <div className="image-upload-box">
          <input type="file" onChange={handleFileChange} accept="image/*" />
          {preview && <img src={preview} alt="Preview" className="image-preview" />}
        </div>
        <button className="primary-button" onClick={handleSearch} disabled={loading}>
          {loading ? "Analyzing..." : "Find Restaurants"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <div className="loader"></div>}

      {detectedFoods.length > 0 && (
        <h3 style={{ textAlign: 'center', marginTop: '2rem' }}>
          Detected Foods: {detectedFoods.join(", ")}
        </h3>
      )}

      <div className="restaurant-grid">
        {restaurants.map((r) => (
          <div key={r.RestaurantId} className="restaurant-card">
            <img src={r.FeaturedImage || 'https://via.placeholder.com/300x200.png?text=No+Image'} alt={r.Name} />
            <div className="card-content">
              <h3>{r.Name}</h3>
              <p className="cuisines">{r.Cuisines}</p>
            </div>
            <div className="card-footer">
              <span className="rating">⭐ {r.Rating}</span>
              <span className="location">{r.Location.City}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageSearch;