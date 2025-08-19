import React, { useState, useEffect, useMemo } from 'react';

// EASY CHALLENGE 1: Password Strength Indicator
interface PasswordStrengthProps {
	password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
	const getStrength = (pwd: string): { score: number; label: string; color: string } => {
		let score = 0;
		if (pwd.length >= 8) score++;
		if (/[A-Z]/.test(pwd)) score++;
		if (/[a-z]/.test(pwd)) score++;
		if (/[0-9]/.test(pwd)) score++;
		if (/[^A-Za-z0-9]/.test(pwd)) score++;

		const strengthMap = {
			0: { label: 'Very Weak', color: 'bg-red-500' },
			1: { label: 'Weak', color: 'bg-orange-500' },
			2: { label: 'Fair', color: 'bg-yellow-500' },
			3: { label: 'Good', color: 'bg-blue-500' },
			4: { label: 'Strong', color: 'bg-green-500' },
			5: { label: 'Very Strong', color: 'bg-green-600' }
		};

		return { score, ...strengthMap[score as keyof typeof strengthMap] };
	};

	const strength = getStrength(password);
	const percentage = (strength.score / 5) * 100;

	return (
		<div className="mb-4">
			<div className="flex justify-between text-sm mb-1">
				<span>Password Strength:</span>
				<span className="font-semibold">{strength.label}</span>
			</div>
			<div className="w-full bg-gray-200 rounded-full h-2">
				<div
					className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
};

// EASY CHALLENGE 2: Copy to Clipboard Button
interface CopyButtonProps {
	text: string;
	children?: React.ReactNode;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text, children = 'Copy' }) => {
	const [copied, setCopied] = useState<boolean>(false);

	const handleCopy = async (): Promise<void> => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	};

	return (
		<button
			onClick={handleCopy}
			className={`px-3 py-1 rounded text-sm transition-colors ${
				copied
					? 'bg-green-500 text-white'
					: 'bg-blue-500 text-white hover:bg-blue-600'
			}`}
		>
			{copied ? '✓ Copied!' : children}
		</button>
	);
};

// EASY CHALLENGE 3: Character Counter
interface CharacterCounterProps {
	maxLength: number;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({
	maxLength,
	value,
	onChange,
	placeholder = 'Type something...'
}) => {
	const remaining = maxLength - value.length;
	const isOverLimit = remaining < 0;

	return (
		<div className="mb-4">
			<textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className={`w-full p-2 border rounded resize-none ${
					isOverLimit ? 'border-red-500' : 'border-gray-300'
				}`}
				rows={4}
			/>
			<div className={`text-sm mt-1 ${isOverLimit ? 'text-red-500' : 'text-gray-600'}`}>
				{remaining >= 0 ? `${remaining} characters remaining` : `${Math.abs(remaining)} characters over limit`}
			</div>
		</div>
	);
};

// EASY CHALLENGE 4: Temperature Converter
const TemperatureConverter: React.FC = () => {
	const [celsius, setCelsius] = useState<string>('');
	const [fahrenheit, setFahrenheit] = useState<string>('');

	const celsiusToFahrenheit = (c: number): number => (c * 9/5) + 32;
	const fahrenheitToCelsius = (f: number): number => (f - 32) * 5/9;

	const handleCelsiusChange = (value: string): void => {
		setCelsius(value);
		if (value === '') {
			setFahrenheit('');
		} else {
			const num = parseFloat(value);
			if (!isNaN(num)) {
				setFahrenheit(celsiusToFahrenheit(num).toFixed(1));
			}
		}
	};

	const handleFahrenheitChange = (value: string): void => {
		setFahrenheit(value);
		if (value === '') {
			setCelsius('');
		} else {
			const num = parseFloat(value);
			if (!isNaN(num)) {
				setCelsius(fahrenheitToCelsius(num).toFixed(1));
			}
		}
	};

	return (
		<div className="mb-4 p-4 border rounded">
			<h3 className="font-bold mb-3">Temperature Converter</h3>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium mb-1">Celsius</label>
					<input
						type="number"
						value={celsius}
						onChange={(e) => handleCelsiusChange(e.target.value)}
						className="w-full p-2 border rounded"
						placeholder="0"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">Fahrenheit</label>
					<input
						type="number"
						value={fahrenheit}
						onChange={(e) => handleFahrenheitChange(e.target.value)}
						className="w-full p-2 border rounded"
						placeholder="32"
					/>
				</div>
			</div>
		</div>
	);
};

// EASY CHALLENGE 5: QR Code Text Generator (Visual representation)
interface QRCodeProps {
	text: string;
	size?: number;
}

const QRCodeDisplay: React.FC<QRCodeProps> = ({ text, size = 120 }) => {
	// Simplified QR code visual representation
	const generatePattern = (input: string): boolean[][] => {
		const gridSize = 21;
		const pattern: boolean[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));

		// Simple pattern based on text hash
		let hash = 0;
		for (let i = 0; i < input.length; i++) {
			hash = ((hash << 5) - hash + input.charCodeAt(i)) & 0xffffffff;
		}

		for (let i = 0; i < gridSize; i++) {
			for (let j = 0; j < gridSize; j++) {
				pattern[i][j] = ((hash + i * j) % 3) === 0;
			}
		}

		return pattern;
	};

	const pattern = generatePattern(text);

	return (
		<div className="mb-4">
			<h4 className="font-semibold mb-2">QR Code (Demo)</h4>
			<div
				className="inline-block border-2 border-gray-300 p-2"
				style={{ width: size, height: size }}
			>
				<div className="grid grid-cols-21 gap-0 w-full h-full">
					{pattern.flat().map((filled, index) => (
						<div
							key={index}
							className={`${filled ? 'bg-black' : 'bg-white'} aspect-square`}
							style={{ fontSize: 0 }}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

// MEDIUM CHALLENGE 1: Advanced Todo List with Categories
interface TodoItem {
	id: string;
	text: string;
	completed: boolean;
	category: string;
	priority: 'low' | 'medium' | 'high';
	dueDate?: Date;
}

const AdvancedTodoList: React.FC = () => {
	const [todos, setTodos] = useState<TodoItem[]>([]);
	const [inputText, setInputText] = useState<string>('');
	const [selectedCategory, setSelectedCategory] = useState<string>('personal');
	const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
	const [filterCategory, setFilterCategory] = useState<string>('all');
	const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

	const categories = ['personal', 'work', 'shopping', 'health'];

	const addTodo = (): void => {
		if (inputText.trim()) {
			const newTodo: TodoItem = {
				id: Date.now().toString(),
				text: inputText,
				completed: false,
				category: selectedCategory,
				priority: selectedPriority
			};
			setTodos([...todos, newTodo]);
			setInputText('');
		}
	};

	const toggleTodo = (id: string): void => {
		setTodos(todos.map(todo =>
			todo.id === id ? { ...todo, completed: !todo.completed } : todo
		));
	};

	const deleteTodo = (id: string): void => {
		setTodos(todos.filter(todo => todo.id !== id));
	};

	const filteredTodos = useMemo(() => {
		return todos.filter(todo => {
			const categoryMatch = filterCategory === 'all' || todo.category === filterCategory;
			const statusMatch = filterStatus === 'all' ||
				(filterStatus === 'completed' && todo.completed) ||
				(filterStatus === 'pending' && !todo.completed);
			return categoryMatch && statusMatch;
		});
	}, [todos, filterCategory, filterStatus]);

	const getPriorityColor = (priority: string): string => {
		switch (priority) {
			case 'high': return 'border-l-red-500';
			case 'medium': return 'border-l-yellow-500';
			case 'low': return 'border-l-green-500';
			default: return 'border-l-gray-500';
		}
	};

	return (
		<div className="mb-6 p-4 border rounded-lg">
			<h3 className="text-lg font-bold mb-4">Advanced Todo List</h3>

			{/* Add Todo Form */}
			<div className="mb-4 p-3 bg-gray-50 rounded">
				<div className="flex flex-wrap gap-2 mb-2">
					<input
						type="text"
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						placeholder="Add a new todo..."
						className="flex-1 min-w-48 p-2 border rounded"
						onKeyPress={(e) => e.key === 'Enter' && addTodo()}
					/>
					<select
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
						className="p-2 border rounded"
					>
						{categories.map(cat => (
							<option key={cat} value={cat}>{cat}</option>
						))}
					</select>
					<select
						value={selectedPriority}
						onChange={(e) => setSelectedPriority(e.target.value as any)}
						className="p-2 border rounded"
					>
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
					</select>
					<button
						onClick={addTodo}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Add
					</button>
				</div>
			</div>

			{/* Filters */}
			<div className="flex gap-4 mb-4">
				<div>
					<label className="block text-sm font-medium mb-1">Category:</label>
					<select
						value={filterCategory}
						onChange={(e) => setFilterCategory(e.target.value)}
						className="p-1 border rounded text-sm"
					>
						<option value="all">All</option>
						{categories.map(cat => (
							<option key={cat} value={cat}>{cat}</option>
						))}
					</select>
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">Status:</label>
					<select
						value={filterStatus}
						onChange={(e) => setFilterStatus(e.target.value as any)}
						className="p-1 border rounded text-sm"
					>
						<option value="all">All</option>
						<option value="pending">Pending</option>
						<option value="completed">Completed</option>
					</select>
				</div>
			</div>

			{/* Todo List */}
			<div className="space-y-2">
				{filteredTodos.length === 0 ? (
					<p className="text-gray-500 text-center py-4">No todos found</p>
				) : (
					filteredTodos.map(todo => (
						<div
							key={todo.id}
							className={`p-3 border-l-4 bg-white rounded shadow-sm ${getPriorityColor(todo.priority)}`}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<input
										type="checkbox"
										checked={todo.completed}
										onChange={() => toggleTodo(todo.id)}
										className="w-4 h-4"
									/>
									<span className={todo.completed ? 'line-through text-gray-500' : ''}>
										{todo.text}
									</span>
									<span className="text-xs px-2 py-1 bg-gray-100 rounded">
										{todo.category}
									</span>
									<span className={`text-xs px-2 py-1 rounded ${
										todo.priority === 'high' ? 'bg-red-100 text-red-800' :
										todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
										'bg-green-100 text-green-800'
									}`}>
										{todo.priority}
									</span>
								</div>
								<button
									onClick={() => deleteTodo(todo.id)}
									className="text-red-500 hover:text-red-700"
								>
									Delete
								</button>
							</div>
						</div>
					))
				)}
			</div>

			{/* Summary */}
			<div className="mt-4 text-sm text-gray-600">
				Total: {todos.length} | Completed: {todos.filter(t => t.completed).length} |
				Pending: {todos.filter(t => !t.completed).length}
			</div>
		</div>
	);
};

// MEDIUM CHALLENGE 2: Debounced Search with Highlights
interface SearchResult {
	id: string;
	title: string;
	description: string;
}

const mockData: SearchResult[] = [
	{ id: '1', title: 'React Hooks Tutorial', description: 'Learn about useState, useEffect, and custom hooks' },
	{ id: '2', title: 'TypeScript Basics', description: 'Getting started with TypeScript in React applications' },
	{ id: '3', title: 'CSS Grid Layout', description: 'Master CSS Grid for responsive web layouts' },
	{ id: '4', title: 'JavaScript ES6 Features', description: 'Arrow functions, destructuring, and modules' },
	{ id: '5', title: 'Node.js Express Server', description: 'Building REST APIs with Express and Node.js' },
];

const DebouncedSearch: React.FC = () => {
	const [query, setQuery] = useState<string>('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [debouncedQuery, setDebouncedQuery] = useState<string>('');

	// Mock data

	// Debounce effect
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query);
		}, 300);

		return () => clearTimeout(timer);
	}, [query]);

	// Search effect
	useEffect(() => {
		if (debouncedQuery.trim()) {
			setLoading(true);
			// Simulate API call
			setTimeout(() => {
				const filtered = mockData.filter(item =>
					item.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
					item.description.toLowerCase().includes(debouncedQuery.toLowerCase())
				);
				setResults(filtered);
				setLoading(false);
			}, 200);
		} else {
			setResults([]);
			setLoading(false);
		}
	}, [debouncedQuery]);

	const highlightText = (text: string, highlight: string): React.ReactNode => {
		if (!highlight) return text;

		const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
		return parts.map((part, index) =>
			part.toLowerCase() === highlight.toLowerCase() ?
				<mark key={index} className="bg-yellow-200">{part}</mark> : part
		);
	};

	return (
		<div className="mb-6 p-4 border rounded-lg">
			<h3 className="text-lg font-bold mb-4">Debounced Search with Highlights</h3>

			<div className="relative">
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search tutorials..."
					className="w-full p-3 border rounded-lg"
				/>

				{loading && (
					<div className="absolute right-3 top-3">
						<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
					</div>
				)}
			</div>

			{query && (
				<div className="mt-4">
					<p className="text-sm text-gray-600 mb-2">
						{loading ? 'Searching...' : `Found ${results.length} result(s) for "${query}"`}
					</p>

					<div className="space-y-3">
						{results.map(result => (
							<div key={result.id} className="p-3 border rounded hover:bg-gray-50">
								<h4 className="font-semibold text-blue-600">
									{highlightText(result.title, debouncedQuery)}
								</h4>
								<p className="text-gray-600 text-sm mt-1">
									{highlightText(result.description, debouncedQuery)}
								</p>
							</div>
						))}

						{!loading && results.length === 0 && debouncedQuery && (
							<p className="text-gray-500 text-center py-4">No results found</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

// Main Demo Component
const MoreInterviewChallenges: React.FC = () => {
	const [password, setPassword] = useState<string>('');
	const [textToCopy] = useState<string>('This is some text to copy!');
	const [characterText, setCharacterText] = useState<string>('');
	const [qrText, setQrText] = useState<string>('Hello, World!');

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-6">
			<h1 className="text-3xl font-bold text-center mb-8">More React Interview Challenges</h1>

			{/* Easy Challenges */}
			<div className="space-y-6">
				<h2 className="text-2xl font-bold text-blue-600">Easy Challenges</h2>

				{/* Password Strength */}
				<div className="p-4 border rounded-lg">
					<h3 className="text-lg font-bold mb-3">Password Strength Indicator</h3>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter password..."
						className="w-full p-2 border rounded mb-3"
					/>
					<PasswordStrength password={password} />
				</div>

				{/* Copy Button */}
				<div className="p-4 border rounded-lg">
					<h3 className="text-lg font-bold mb-3">Copy to Clipboard</h3>
					<div className="flex items-center space-x-3">
						<code className="bg-gray-100 p-2 rounded flex-1">{textToCopy}</code>
						<CopyButton text={textToCopy} />
					</div>
				</div>

				{/* Character Counter */}
				<div className="p-4 border rounded-lg">
					<h3 className="text-lg font-bold mb-3">Character Counter</h3>
					<CharacterCounter
						maxLength={100}
						value={characterText}
						onChange={setCharacterText}
						placeholder="Type your message here..."
					/>
				</div>

				{/* Temperature Converter */}
				<TemperatureConverter />

				{/* QR Code Display */}
				<div className="p-4 border rounded-lg">
					<h3 className="text-lg font-bold mb-3">QR Code Generator (Demo)</h3>
					<input
						type="text"
						value={qrText}
						onChange={(e) => setQrText(e.target.value)}
						placeholder="Enter text for QR code..."
						className="w-full p-2 border rounded mb-3"
					/>
					<QRCodeDisplay text={qrText} />
				</div>
			</div>

			{/* Medium Challenges */}
			<div className="space-y-6">
				<h2 className="text-2xl font-bold text-green-600">Medium Challenges</h2>

				<AdvancedTodoList />
				<DebouncedSearch />
			</div>
		</div>
	);
};

export default MoreInterviewChallenges;


