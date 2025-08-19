import { useState } from 'react';

interface StarRatingProps {
	rating: number;
	onRatingChange?: (rating: number) => void;
	maxRating?: number;
	readOnly?: boolean;
	allowHalf?: boolean;
}

export default function StarRating({
	rating,
	onRatingChange,
	maxRating = 5,
	readOnly = false,
}:StarRatingProps) {
	// const [hover, setHover] = useState<number>(0);

	const handleClick = (value: number): void => {
		if (!readOnly && onRatingChange) {
			onRatingChange(value)
		}
	}

	// const handleMouseEnter = (value:number): void => {
	// 	if (!readOnly) {
	// 		setHover(value)
	// 	}
	// }

	// const handleMouseLeave = (): void => {
	// 	setHover(0)
	// }

	const renderStar = (index: number): React.ReactNode => {
		const starValue = index + 1;

		return (
			<span
				key={index}
				onClick={() => handleClick(starValue)}
			>
				<span className="text-gray-300">★</span>
			</span>
		);
	}

	return (<div className="mb-4">
		<h3 className="text-lg font-bold mb-2">Star Rating</h3>
		<div className="flex space-x-1">
			{Array.from({ length: maxRating }, (_, index) => renderStar(index))}
		</div>
		<p className="text-sm text-gray-600 mt-1">
			Rating: {rating}/{maxRating} {readOnly && "(Read-only)"}
		</p>
	</div>)
}
