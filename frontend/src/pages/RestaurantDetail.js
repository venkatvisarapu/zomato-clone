import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../apiConfig";
const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/restaurants/${id}`)
      .then(res => setRestaurant(res.data))
      .catch(err => console.log(err));
  }, [id]);

  if (!restaurant) return <h2>Loading...</h2>;

  return (
    <div className="container">
      <div className="restaurant-detail">
        <img src={restaurant.FeaturedImage || "https://via.placeholder.com/300"} alt={restaurant.Name} />
        <h2>{restaurant.Name}</h2>
        <p>Cuisines: {restaurant.Cuisines}</p>
        <p>📍 Address: {restaurant.Location.Address}, {restaurant.Location.City}</p>
        <p>💰 Cost for Two: {restaurant.AverageCost} {restaurant.Currency}</p>
        <p>⭐ Rating: {restaurant.Rating} ({restaurant.Votes} votes)</p>
        <p><a href={restaurant.MenuURL} target="_blank" rel="noopener noreferrer">📖 View Menu</a></p>
        <p><a href={restaurant.PhotosURL} target="_blank" rel="noopener noreferrer">📸 View Photos</a></p>
      </div>
    </div>
  );
};

export default RestaurantDetail;
