// src/components/ReviewStars.jsx
import React from 'react';

 const ReviewStars = ({ rating, size = 'md', interactive = false, onRatingChange }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-10 h-10',
    };

    const [hoveredRating, setHoveredRating] = React.useState(0);

    const handleClick = (index) => {
        if (interactive && onRatingChange) {
            onRatingChange(index + 1);
        }
    };

    const handleMouseEnter = (index) => {
        if (interactive) {
            setHoveredRating(index + 1);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoveredRating(0);
        }
    };

    const displayRating = interactive && hoveredRating > 0 ? hoveredRating : rating;

    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => handleClick(index)}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
                    disabled={!interactive}
                >
                    <svg
                        className={`${sizes[size]} ${
                            index < displayRating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 fill-current'
                        } transition-colors`}
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
        </div>
    );
};
export default ReviewStars;