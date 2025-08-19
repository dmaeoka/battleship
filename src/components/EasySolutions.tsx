import { useState, useContext } from 'react';
import TodoList from './TodoList';
import ProgressBar from './ProgressBar';
import CounterWithHistory from './CounterWithHistory';
import ColorPicker from './ColorPicker';
import StarRating from './StarRating';
import { GameContext } from '../context/GameContext';

const EasySolutions: React.FC = () => {
	const [colour, setColour] = useState('#FF0000');
	const [progress, setProgress] = useState<number>(45);
	const [starRating, setStarRating] = useState<number>(1);
	const gameContext = useContext(GameContext);

	if (!gameContext) {
		throw new Error('EasySolutions must be used within a GameProvider');
	}

	const { favouriteGame, setFavouriteGame } = gameContext;

	return (
		<>
			<div className='flex gap-2 items-center mb-4'>
				<span>{favouriteGame}</span>
				<button onClick={() => setFavouriteGame("Halo")} className="bg-red-500 text-white px-3 py-1 rounded">Change Game</button>
			</div>

			<TodoList />

			<CounterWithHistory />

			<ColorPicker
				selectedColor={colour}
				onColorChange={setColour} />

			<StarRating
				rating={starRating}
				onRatingChange={setStarRating}
				maxRating={5}
				readOnly={false}
			/>

			<div className="p-4 border rounded-lg">
				<ProgressBar
					percentage={progress}
					showLabel={true}
					label="Loading Progress"
					theme="blue"
				/>
				<div className="mt-2 space-x-2">
					<button
						onClick={() => setProgress(Math.max(0, progress - Math.floor((Math.random() * 10))))}
						className="bg-red-500 text-white px-3 py-1 rounded"
					>-</button>
					<button
						onClick={() => setProgress(Math.min(100, progress + Math.floor((Math.random() * 10))))}
						className="bg-green-500 text-white px-3 py-1 rounded"
					>+</button>
				</div>
			</div>
		</>
	)
}

export default EasySolutions;
