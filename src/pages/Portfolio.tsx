import './Portfolio.css';
import React from 'react';
import pageunderconstruction from '../assets/images/pageunderconstruction.jpg';

const Portfolio: React.FC = () => {
  return (
    <div className="portfolio">
        <img src={pageunderconstruction} alt="Portfolio" />
    </div>
    );
};

export default Portfolio;