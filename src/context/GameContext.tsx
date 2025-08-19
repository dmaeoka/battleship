import { useState, createContext } from 'react';

interface GameContextType {
	favouriteGame: string;
	setFavouriteGame: React.Dispatch<React.SetStateAction<string>>;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

const GameProvider: React.FC<{ children: React.ReactNode | string }> = ({ children }) => {
	const [favouriteGame, setFavouriteGame] = useState("DOOM");

	return (
		<GameContext.Provider value={{ favouriteGame, setFavouriteGame }}>
			{children}
		</GameContext.Provider>
	)
}

export default GameProvider;
