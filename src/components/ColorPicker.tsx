interface ColorPickerProps {
	selectedColor: string;
	onColorChange: (color: string) => void;
	colors?: string[];
}

const ColorPicker: React.FC<ColorPickerProps> = ({
	selectedColor,
	onColorChange,
	colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080']
}) => {
	return (
		<div className="mb-4">
			<h3 className="text-lg font-bold mb-2">Color Picker</h3>
			<div className="mb-3">
				<div
					className="w-16 h-16 border-2 border-gray-300 rounded"
					style={{ backgroundColor: selectedColor }}
					aria-label={`Selected color: ${selectedColor}`}
				/>
				<p className="text-sm mt-1">Selected: {selectedColor}</p>
			</div>
			<div className="grid grid-cols-4 gap-2 max-w-xs">
				{colors.map((color) => (
					<button
						key={color}
						className={`
							w-12 h-12 rounded border-2 transition-all
							${selectedColor === color ? 'border-black border-4' : 'border-gray-300'}
							hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500
						`}
						style={{ backgroundColor: color }}
						onClick={() => onColorChange(color)}
						aria-label={`Select color ${color}`}
					/>
				))}
			</div>
		</div>
	);
};

export default ColorPicker;
