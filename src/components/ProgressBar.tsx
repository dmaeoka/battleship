interface ProgressBarProps {
	percentage: number;
	showLabel?: boolean;
	showPercentage?: boolean;
	label?: string;
	theme?: 'blue' | 'green' | 'red' | 'purple';
	height?: 'sm' | 'md' | 'lg';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
	percentage,
	showLabel = false,
	showPercentage = true,
	label,
	theme = 'blue',
	height = 'md'
}) => {
	const clampedPercentage = Math.max(0, Math.min(100, percentage));

	const themeColors = {
		blue: 'bg-blue-500',
		green: 'bg-green-500',
		red: 'bg-red-500',
		purple: 'bg-purple-500'
	};

	const heights = {
		sm: 'h-2',
		md: 'h-4',
		lg: 'h-6'
	};

	return (
		<div className="mb-4">
			<h3 className="text-lg font-bold mb-2">Progress Bar</h3>
			{(showLabel && label) && (
				<div className="flex justify-between mb-1">
					<span className="text-sm font-medium">{label}</span>
					{showPercentage && <span className="text-sm">{clampedPercentage}%</span>}
				</div>
			)}
			<div className={`w-full bg-gray-200 rounded-full ${heights[height]}`}>
				<div
					className={`${themeColors[theme]} ${heights[height]} rounded-full transition-all duration-300 ease-out`}
					style={{ width: `${clampedPercentage}%` }}
					role="progressbar"
					aria-valuenow={clampedPercentage}
					aria-valuemin={0}
					aria-valuemax={100}
				/>
			</div>
			{!showLabel && showPercentage && (
				<p className="text-sm text-center mt-1">{clampedPercentage}%</p>
			)}
		</div>
	);
};

export default ProgressBar;
