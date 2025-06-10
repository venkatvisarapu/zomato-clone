import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../apiConfig";
const LocationSearch = () => {
  const [latitude, setLatitude] =useState("");
  const [longitude, setLongitude] = useState("");
  const [range, setRange] = useState("3");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!latitude || !longitude) {
      setError("Please provide both latitude and longitude.");
      return;
    }
    setError("");
    setLoading(true);
    setRestaurants([]);

    axios.get(`${API_BASE_URL}/restaurants/nearby?lat=${latitude}&lng=${longitude}&range=${range}`)
      .then((res) => {
        setRestaurants(res.data);
        if (res.data.length === 0) {
          setError("No restaurants found in this area. Try a larger range.");
        }
      })
      .catch(() => setError("Could not fetch restaurants. Please try again."))
      .finally(() => setLoading(false));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setError("");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          setLoading(false);
        },
        () => {
          setError("Unable to retrieve your location. Please enter it manually.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>📍 Find Restaurants Near You</h1>
        <p>Use your current location or enter coordinates to find places to eat.</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <input type="text" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
          <input type="text" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="2">Within 2 km</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
          </select>
        </div>
        <div className="form-group" style={{ justifyContent: 'center', gap: '1rem' }}>
          <button type="button" onClick={handleGetLocation} className="secondary-button">Get My Location</button>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Searching..." : "Search Restaurants"}
          </button>
        </div>
      </form>
      
      {error && <p className="error">{error}</p>}
      {loading && <div className="loader"></div>}

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

export default LocationSearch;