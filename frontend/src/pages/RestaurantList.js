import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../apiConfig";

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false); 

  
  const fetchRestaurants = (currentPage, query) => {
    setLoading(true);
    let url;

    if (query) {
      
      setIsSearching(true);
      url = `${API_BASE_URL}/restaurants/search?query=${encodeURIComponent(query)}`;
    } else {
      
      setIsSearching(false);
      url = `${API_BASE_URL}/restaurants?page=${currentPage}`;
    }

    axios.get(url)
      .then(res => {
        setRestaurants(res.data.restaurants);
        
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching restaurants:", err);
        setLoading(false);
      });
  };

  
  useEffect(() => {
    
    if (!isSearching) {
      fetchRestaurants(page, "");
    }
  }, [page]); 

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRestaurants(1, searchQuery);
  };
  
  
  const clearSearch = () => {
      setSearchQuery("");
      setIsSearching(false);
      
      fetchRestaurants(1, ""); 
  };

  return (
    <div className="container">
      <div className="hero-section">
        <h1>Discover Your Next Favorite Meal</h1>
        <p>Search for restaurants by name, cuisine, or city</p>
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="e.g., Pizza, New Delhi, or Italian"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
          {}
          {isSearching && (
            <button type="button" onClick={clearSearch} style={{backgroundColor: '#6c757d'}}>Clear</button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="loader"></div>
      ) : (
        <div className="restaurant-grid">
          {restaurants && restaurants.length > 0 ? (
             restaurants.map((r) => (
              <div key={r.RestaurantId} className="restaurant-card">
                <img src={r.FeaturedImage || 'https://via.placeholder.com/300x200.png?text=No+Image'} alt={r.Name} />
                <div className="card-content">
                  <h3><Link to={`/restaurant/${r.RestaurantId}`}>{r.Name}</Link></h3>
                  <p className="cuisines">{r.Cuisines}</p>
                </div>
                <div className="card-footer">
                  <span className="rating">⭐ {r.Rating}</span>
                  <span className="location">{r.Location.City}</span>
                </div>
              </div>
            ))
          ) : (
            <p style={{textAlign: 'center', gridColumn: '1 / -1'}}>No restaurants found. Try a different search.</p>
          )}
        </div>
      )}

      {}
      {!isSearching && totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>Previous</button>
          <span> Page {page} of {totalPages} </span>
          <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next</button>
        </div>
      )}
    </div>
  );
};

export default RestaurantList;