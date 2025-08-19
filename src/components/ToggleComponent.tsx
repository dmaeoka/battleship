interface ToggleProps {
	isOn: boolean;
	onToggle: (value: boolean) => void;
	onLabel?: string;
	offLabel?: string;
	disabled?: boolean;
	id?: string;
}

export default function ToggleComponent({
	isOn,
	onToggle,
	onLabel = 'On',
	offLabel = 'Off',
	disabled = false,
	id = 'toggle'
}: ToggleProps) {

	const handleToggle = (): void => {
		if (!disabled) onToggle(!isOn);
	}

	return (
		<div>
			<span>{offLabel}</span>
			<div id={`id__${id}`} onClick={handleToggle}>---- { JSON.stringify(isOn) }</div>
			<span>{onLabel}</span>
		</div>
	)
}
