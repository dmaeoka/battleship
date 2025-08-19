import React, { useState, useCallback, useMemo, createContext, useContext, useReducer } from 'react';

interface FormStep {
	id: string;
	title: string;
	component: React.ComponentType<unknown>;
	validation?: (data: unknown) => string[];
}

interface FormWizardProps {
	steps: FormStep[];
	onComplete: (data: unknown) => void;
	initialData?: unknown;
}

const FormWizard: React.FC<FormWizardProps> = ({ steps, onComplete, initialData = {} }) => {
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [formData, setFormData] = useState<unknown>(initialData);
	const [errors, setErrors] = useState<string[]>([]);

	const validateCurrentStep = (): boolean => {
		const step = steps[currentStep];
		if (step.validation) {
			const stepErrors = step.validation(formData);
			setErrors(stepErrors);
			return stepErrors.length === 0;
		}
		setErrors([]);
		return true;
	};

	const goToNext = (): void => {
		if (validateCurrentStep()) {
			if (currentStep < steps.length - 1) {
				setCurrentStep(prev => prev + 1);
			} else {
				onComplete(formData);
			}
		}
	};

	const goToPrevious = (): void => {
		if (currentStep > 0) {
			setCurrentStep(prev => prev - 1);
			setErrors([]);
		}
	};

	const updateFormData = (newData: unknown): void => {
		setFormData(prev => ({ ...prev, ...newData }));
	};

	const CurrentStepComponent = steps[currentStep].component;

	return (
		<div className="max-w-2xl mx-auto p-6 border rounded-lg">
			<h3 className="text-lg font-bold mb-4">Multi-Step Form Wizard</h3>

			{/* Progress indicator */}
			<div className="mb-6">
				<div className="flex justify-between text-sm text-gray-600 mb-2">
					{steps.map((step, index) => (
						<span
							key={step.id}
							className={`${index <= currentStep ? 'text-blue-600 font-semibold' : ''}`}
						>
							{step.title}
						</span>
					))}
				</div>
				<div className="w-full bg-gray-200 rounded-full h-2">
					<div
						className="bg-blue-600 h-2 rounded-full transition-all duration-300"
						style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
					/>
				</div>
				<div className="text-sm text-gray-600 mt-1">
					Step {currentStep + 1} of {steps.length}
				</div>
			</div>

			{/* Form content */}
			<div className="mb-6">
				<CurrentStepComponent
					data={formData}
					updateData={updateFormData}
					errors={errors}
				/>
			</div>

			{/* Navigation buttons */}
			<div className="flex justify-between">
				<button
					onClick={goToPrevious}
					disabled={currentStep === 0}
					className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Previous
				</button>
				<button
					onClick={goToNext}
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
				>
					{currentStep === steps.length - 1 ? 'Complete' : 'Next'}
				</button>
			</div>
		</div>
	);
};

// Sample form steps
const PersonalInfoStep: React.FC<unknown> = ({ data, updateData, errors }) => (
	<div>
		<h4 className="font-semibold mb-3">Personal Information</h4>
		<div className="space-y-3">
			<input
				type="text"
				placeholder="First Name"
				value={data.firstName || ''}
				onChange={(e) => updateData({ firstName: e.target.value })}
				className="w-full p-2 border rounded"
			/>
			<input
				type="text"
				placeholder="Last Name"
				value={data.lastName || ''}
				onChange={(e) => updateData({ lastName: e.target.value })}
				className="w-full p-2 border rounded"
			/>
			<input
				type="email"
				placeholder="Email"
				value={data.email || ''}
				onChange={(e) => updateData({ email: e.target.value })}
				className="w-full p-2 border rounded"
			/>
		</div>
		{errors.length > 0 && (
			<div className="mt-2 text-red-600 text-sm">
				{errors.map((error, index) => <div key={index}>{error}</div>)}
			</div>
		)}
	</div>
);

const ContactInfoStep: React.FC<unknown> = ({ data, updateData, errors }) => (
	<div>
		<h4 className="font-semibold mb-3">Contact Information</h4>
		<div className="space-y-3">
			<input
				type="tel"
				placeholder="Phone Number"
				value={data.phone || ''}
				onChange={(e) => updateData({ phone: e.target.value })}
				className="w-full p-2 border rounded"
			/>
			<input
				type="text"
				placeholder="Address"
				value={data.address || ''}
				onChange={(e) => updateData({ address: e.target.value })}
				className="w-full p-2 border rounded"
			/>
			<input
				type="text"
				placeholder="City"
				value={data.city || ''}
				onChange={(e) => updateData({ city: e.target.value })}
				className="w-full p-2 border rounded"
			/>
		</div>
		{errors.length > 0 && (
			<div className="mt-2 text-red-600 text-sm">
				{errors.map((error, index) => <div key={index}>{error}</div>)}
			</div>
		)}
	</div>
);

const ReviewStep: React.FC<unknown> = ({ data }) => (
	<div>
		<h4 className="font-semibold mb-3">Review Your Information</h4>
		<div className="space-y-2 text-sm">
			<div><strong>Name:</strong> {data.firstName} {data.lastName}</div>
			<div><strong>Email:</strong> {data.email}</div>
			<div><strong>Phone:</strong> {data.phone}</div>
			<div><strong>Address:</strong> {data.address}, {data.city}</div>
		</div>
	</div>
);

// 19. State Management with Context (Shopping Cart Example)
interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
}

interface CartState {
	items: CartItem[];
	total: number;
}

type CartAction =
	| { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
	| { type: 'REMOVE_ITEM'; payload: { id: string } }
	| { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
	| { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
	switch (action.type) {
		case 'ADD_ITEM': {
			const existingItem = state.items.find(item => item.id === action.payload.id);
			let newItems: CartItem[];

			if (existingItem) {
				newItems = state.items.map(item =>
					item.id === action.payload.id
						? { ...item, quantity: item.quantity + 1 }
						: item
				);
			} else {
				newItems = [...state.items, { ...action.payload, quantity: 1 }];
			}

			const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
			return { items: newItems, total };
		}

		case 'REMOVE_ITEM': {
			const newItems = state.items.filter(item => item.id !== action.payload.id);
			const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
			return { items: newItems, total };
		}

		case 'UPDATE_QUANTITY': {
			const newItems = state.items.map(item =>
				item.id === action.payload.id
					? { ...item, quantity: action.payload.quantity }
					: item
			).filter(item => item.quantity > 0);

			const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
			return { items: newItems, total };
		}

		case 'CLEAR_CART':
			return { items: [], total: 0 };

		default:
			return state;
	}
};

interface CartContextType {
	state: CartState;
	addItem: (item: Omit<CartItem, 'quantity'>) => void;
	removeItem: (id: string) => void;
	updateQuantity: (id: string, quantity: number) => void;
	clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

	const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
		dispatch({ type: 'ADD_ITEM', payload: item });
	}, []);

	const removeItem = useCallback((id: string) => {
		dispatch({ type: 'REMOVE_ITEM', payload: { id } });
	}, []);

	const updateQuantity = useCallback((id: string, quantity: number) => {
		dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
	}, []);

	const clearCart = useCallback(() => {
		dispatch({ type: 'CLEAR_CART' });
	}, []);

	const value = useMemo(() => ({
		state,
		addItem,
		removeItem,
		updateQuantity,
		clearCart
	}), [state, addItem, removeItem, updateQuantity, clearCart]);

	return (
		<CartContext.Provider value={value}>
			{children}
		</CartContext.Provider>
	);
};

const useCart = (): CartContextType => {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error('useCart must be used within a CartProvider');
	}
	return context;
};

// Shopping Cart Component
const ShoppingCart: React.FC = () => {
	const { state, addItem, removeItem, updateQuantity, clearCart } = useCart();

	const sampleProducts = [
		{ id: '1', name: 'Laptop', price: 999 },
		{ id: '2', name: 'Mouse', price: 25 },
		{ id: '3', name: 'Keyboard', price: 75 },
	];

	return (
		<div className="p-4 border rounded-lg">
			<h3 className="text-lg font-bold mb-4">Shopping Cart (Context + useReducer)</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Products */}
				<div>
					<h4 className="font-semibold mb-2">Products</h4>
					<div className="space-y-2">
						{sampleProducts.map(product => (
							<div key={product.id} className="flex justify-between items-center p-2 border rounded">
								<span>{product.name} - ${product.price}</span>
								<button
									onClick={() => addItem(product)}
									className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
								>
									Add to Cart
								</button>
							</div>
						))}
					</div>
				</div>

				{/* Cart */}
				<div>
					<div className="flex justify-between items-center mb-2">
						<h4 className="font-semibold">Cart ({state.items.length} items)</h4>
						<button
							onClick={clearCart}
							className="px-2 py-1 bg-red-500 text-white rounded text-sm"
						>
							Clear
						</button>
					</div>

					{state.items.length === 0 ? (
						<p className="text-gray-500">Cart is empty</p>
					) : (
						<div className="space-y-2">
							{state.items.map(item => (
								<div key={item.id} className="flex justify-between items-center p-2 border rounded">
									<div>
										<div className="font-medium">{item.name}</div>
										<div className="text-sm text-gray-600">${item.price} x {item.quantity}</div>
									</div>
									<div className="flex items-center space-x-2">
										<button
											onClick={() => updateQuantity(item.id, item.quantity - 1)}
											className="px-2 py-1 bg-gray-300 rounded text-sm"
										>
											-
										</button>
										<span>{item.quantity}</span>
										<button
											onClick={() => updateQuantity(item.id, item.quantity + 1)}
											className="px-2 py-1 bg-gray-300 rounded text-sm"
										>
											+
										</button>
										<button
											onClick={() => removeItem(item.id)}
											className="px-2 py-1 bg-red-500 text-white rounded text-sm"
										>
											Remove
										</button>
									</div>
								</div>
							))}
							<div className="text-right font-bold text-lg">
								Total: ${state.total.toFixed(2)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

// 21. Error Boundary Implementation
interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<
	{ children: React.ReactNode; fallback?: React.ComponentType<unknown> },
	ErrorBoundaryState
> {
	constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<unknown> }) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		this.setState({
			error,
			errorInfo
		});

		// Log error to monitoring service
		console.error('Error caught by boundary:', error, errorInfo);
	}

	resetError = () => {
		this.setState({ hasError: false, error: null, errorInfo: null });
	};

	render() {
		if (this.state.hasError) {
			const FallbackComponent = this.props.fallback || DefaultErrorFallback;
			return <FallbackComponent onReset={this.resetError} error={this.state.error} />;
		}

		return this.props.children;
	}
}

const DefaultErrorFallback: React.FC<{ onReset: () => void; error: Error | null }> = ({ onReset, error }) => (
	<div className="p-4 border border-red-300 rounded-lg bg-red-50">
		<h3 className="text-lg font-bold text-red-800 mb-2">Something went wrong</h3>
		<p className="text-red-600 mb-4">
			{error?.message || 'An unexpected error occurred'}
		</p>
		<button
			onClick={onReset}
			className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
		>
			Try Again
		</button>
	</div>
);

// Component that throws error for demo
const BuggyComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
	if (shouldThrow) {
		throw new Error('This is a demo error!');
	}
	return <div className="p-2 bg-green-100 rounded">Component working correctly!</div>;
};

// Main Demo Component
const AdvancedSolutions: React.FC = () => {
	const [formCompleted, setFormCompleted] = useState<boolean>(false);
	const [completedData, setCompletedData] = useState<unknown>(null);
	const [shouldThrowError, setShouldThrowError] = useState<boolean>(false);

	const formSteps: FormStep[] = [
		{
			id: 'personal',
			title: 'Personal',
			component: PersonalInfoStep,
			validation: (data) => {
				const errors: string[] = [];
				if (!data.firstName) errors.push('First name is required');
				if (!data.lastName) errors.push('Last name is required');
				if (!data.email || !data.email.includes('@')) errors.push('Valid email is required');
				return errors;
			}
		},
		{
			id: 'contact',
			title: 'Contact',
			component: ContactInfoStep,
			validation: (data) => {
				const errors: string[] = [];
				if (!data.phone) errors.push('Phone number is required');
				if (!data.address) errors.push('Address is required');
				return errors;
			}
		},
		{
			id: 'review',
			title: 'Review',
			component: ReviewStep
		}
	];

	const handleFormComplete = (data: unknown): void => {
		setCompletedData(data);
		setFormCompleted(true);
	};

	const resetForm = (): void => {
		setFormCompleted(false);
		setCompletedData(null);
	};

	return (
		<CartProvider>
			<div className="max-w-4xl mx-auto p-6 space-y-8">
				<h1 className="text-3xl font-bold text-center mb-8">Advanced Interview Solutions</h1>

				{/* Multi-step Form */}
				<div>
					{!formCompleted ? (
						<FormWizard
							steps={formSteps}
							onComplete={handleFormComplete}
						/>
					) : (
						<div className="max-w-2xl mx-auto p-6 border rounded-lg bg-green-50">
							<h3 className="text-lg font-bold text-green-800 mb-4">Form Completed Successfully!</h3>
							<pre className="text-sm bg-white p-3 rounded border">
								{JSON.stringify(completedData, null, 2)}
							</pre>
							<button
								onClick={resetForm}
								className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
							>
								Start Over
							</button>
						</div>
					)}
				</div>

				{/* Shopping Cart with Context */}
				<ShoppingCart />

				{/* Error Boundary Demo */}
				<div className="p-4 border rounded-lg">
					<h3 className="text-lg font-bold mb-4">Error Boundary Demo</h3>
					<div className="mb-4">
						<button
							onClick={() => setShouldThrowError(!shouldThrowError)}
							className="px-4 py-2 bg-red-600 text-white rounded mr-2"
						>
							{shouldThrowError ? 'Fix Component' : 'Break Component'}
						</button>
					</div>

					<ErrorBoundary>
						<BuggyComponent shouldThrow={shouldThrowError} />
					</ErrorBoundary>
				</div>
			</div>
		</CartProvider>
	);
};

export default AdvancedSolutions;
