interface ButtonProps {
	onClick?: () => void;
	children: React.ReactNode | string;
	disabled?: boolean;
}

export default function Button({ onClick, children, disabled = false }: ButtonProps) {
	return (
		<button onClick={onClick} disabled={disabled}>
			{children}
		</button>
	)
}
