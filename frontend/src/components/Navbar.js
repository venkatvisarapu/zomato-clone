import React from "react";
import { Link, NavLink } from "react-router-dom";
import "../styles.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">🍽️ TOMATO</Link>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>Home</NavLink>
        <NavLink to="/search/location" className={({ isActive }) => (isActive ? "active" : "")}>Nearby</NavLink>
        <NavLink to="/search/image" className={({ isActive }) => (isActive ? "active" : "")}>Image Search</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;