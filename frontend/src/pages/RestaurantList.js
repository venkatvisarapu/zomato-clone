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
  const [isSearching, setIsSearching] = useState(false); // ✨ New state to track search mode

  // This function will be our single source for fetching data
  const fetchRestaurants = (currentPage, query) => {
    setLoading(true);
    let url;

    if (query) {
      // We are in search mode
      setIsSearching(true);
      url = `${API_BASE_URL}/restaurants/search?query=${encodeURIComponent(query)}`;
    } else {
      // We are in pagination mode
      setIsSearching(false);
      url = `${API_BASE_URL}/restaurants?page=${currentPage}`;
    }

    axios.get(url)
      .then(res => {
        setRestaurants(res.data.restaurants);
        // Set total pages only if we are not searching, as the search endpoint doesn't provide it
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching restaurants:", err);
        setLoading(false);
      });
  };

  // ✨ CHANGE #1: Use a useEffect hook that runs whenever the 'page' changes
  // This will handle both the initial load and clicking the "Next"/"Previous" buttons.
  useEffect(() => {
    // Only run this if we are NOT in search mode.
    if (!isSearching) {
      fetchRestaurants(page, "");
    }
  }, [page]); // This effect depends on the 'page' state

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page for new search
    fetchRestaurants(1, searchQuery);
  };
  
  // ✨ CHANGE #2: Add a function to clear the search and return to the main list
  const clearSearch = () => {
      setSearchQuery("");
      setIsSearching(false);
      // Fetch the first page of the full list again
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
          {/* ✨ CHANGE #3: Add a clear button that appears during a search */}
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

      {/* ✨ CHANGE #4: Show pagination only when NOT searching and if there's more than one page */}
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