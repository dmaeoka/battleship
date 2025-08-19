import GameProvider from '../context/GameContext';
import EasySolutions from './EasySolutions';
import MediumSolutions from './MediumSolutions';
import AdvancedSolutions from './AdvancedSolutions';
import MoreInterviewChallenges from './MoreInterviewChallenges';
import EasyChallengesDemo from './EasyChallengesDemo';
import { useWindowSize } from '../hooks';

const Challenge: React.FC<{ children: React.ReactNode | string }> = ({ children }) => {
	const windowSize = useWindowSize();

	console.log(windowSize);

	return (
		<GameProvider>

			<EasyChallengesDemo />

			<EasySolutions />

			<MoreInterviewChallenges />


			<MediumSolutions />

			<AdvancedSolutions />

			{children}
		</GameProvider>
	)
}

export default Challenge;
