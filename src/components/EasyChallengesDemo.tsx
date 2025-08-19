import React, { useState, useEffect } from 'react';

// 31. Accordion Component
interface AccordionItem {
	id: string;
	title: string;
	content: string;
}

interface AccordionProps {
	items: AccordionItem[];
	allowMultiple?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ items, allowMultiple = false }) => {
	const [openItems, setOpenItems] = useState<Set<string>>(new Set());

	const toggleItem = (id: string): void => {
		setOpenItems(prev => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				if (!allowMultiple) {
					newSet.clear();
				}
				newSet.add(id);
			}
			return newSet;
		});
	};

	const handleKeyDown = (e: React.KeyboardEvent, id: string): void => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggleItem(id);
		}
	};

	return (
		<div className="w-full border border-gray-200 rounded-lg overflow-hidden">
			{items.map((item, index) => (
				<div key={item.id} className={index !== items.length - 1 ? 'border-b border-gray-200' : ''}>
					<button
						className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
						onClick={() => toggleItem(item.id)}
						onKeyDown={(e) => handleKeyDown(e, item.id)}
						aria-expanded={openItems.has(item.id)}
					>
						<span className="font-medium">{item.title}</span>
						<span className={`transform transition-transform duration-200 ${
							openItems.has(item.id) ? 'rotate-180' : ''
						}`}>
							▼
						</span>
					</button>
					<div
						className={`overflow-hidden transition-all duration-300 ease-in-out ${
							openItems.has(item.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
						}`}
					>
						<div className="px-4 py-3 bg-gray-50 text-gray-700">
							{item.content}
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

// 32. Breadcrumb Navigation
interface BreadcrumbItem {
	label: string;
	href?: string;
	isActive?: boolean;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
	separator?: string;
	maxItems?: number;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, separator = '/', maxItems = 5 }) => {
	const displayItems = items.length > maxItems
		? [items[0], { label: '...', href: undefined }, ...items.slice(-maxItems + 2)]
		: items;

	return (
		<nav aria-label="Breadcrumb">
			<ol className="flex items-center space-x-2 text-sm">
				{displayItems.map((item, index) => (
					<li key={index} className="flex items-center">
						{index > 0 && (
							<span className="mx-2 text-gray-400">{separator}</span>
						)}
						{item.isActive || !item.href ? (
							<span className="text-gray-900 font-medium">{item.label}</span>
						) : (
							<a
								href={item.href}
								className="text-blue-600 hover:text-blue-800 hover:underline"
							>
								{item.label}
							</a>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
};

// 33. Loading Spinner Component
interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg';
	type?: 'spinner' | 'dots' | 'bars';
	color?: string;
	label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	size = 'md',
	type = 'spinner',
	color = 'blue',
	label
}) => {
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12'
	};

	const renderSpinner = () => {
		switch (type) {
			case 'spinner':
				return (
					<div
						className={`${sizeClasses[size]} border-2 border-gray-200 border-t-${color}-500 rounded-full animate-spin`}
					/>
				);
			case 'dots':
				return (
					<div className="flex space-x-1">
						{[0, 1, 2].map(i => (
							<div
								key={i}
								className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'}
									bg-${color}-500 rounded-full animate-bounce`}
								style={{ animationDelay: `${i * 0.1}s` }}
							/>
						))}
					</div>
				);
			case 'bars':
				return (
					<div className="flex space-x-1 items-end">
						{[0, 1, 2, 3].map(i => (
							<div
								key={i}
								className={`${size === 'sm' ? 'w-1' : size === 'md' ? 'w-2' : 'w-3'}
									bg-${color}-500 animate-pulse`}
								style={{
									height: size === 'sm' ? '16px' : size === 'md' ? '24px' : '32px',
									animationDelay: `${i * 0.15}s`
								}}
							/>
						))}
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className="flex flex-col items-center space-y-2">
			{renderSpinner()}
			{label && <span className="text-sm text-gray-600">{label}</span>}
		</div>
	);
};

// 34. Notification/Toast Component
interface NotificationProps {
	type: 'success' | 'error' | 'warning' | 'info';
	message: string;
	duration?: number;
	onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, duration = 5000, onClose }) => {
	useEffect(() => {
		if (duration > 0) {
			const timer = setTimeout(onClose, duration);
			return () => clearTimeout(timer);
		}
	}, [duration, onClose]);

	const typeStyles = {
		success: 'bg-green-50 border-green-200 text-green-800',
		error: 'bg-red-50 border-red-200 text-red-800',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
		info: 'bg-blue-50 border-blue-200 text-blue-800'
	};

	const icons = {
		success: '✓',
		error: '✕',
		warning: '⚠',
		info: 'ℹ'
	};

	return (
		<div className={`flex items-center p-4 border rounded-lg shadow-lg ${typeStyles[type]} animate-in slide-in-from-right`}>
			<span className="mr-3 text-lg">{icons[type]}</span>
			<span className="flex-1">{message}</span>
			<button
				onClick={onClose}
				className="ml-3 text-lg hover:opacity-70 focus:outline-none"
			>
				×
			</button>
		</div>
	);
};

// 35. Tabs Component
interface Tab {
	id: string;
	label: string;
	content: React.ReactNode;
	disabled?: boolean;
}

interface TabsProps {
	tabs: Tab[];
	defaultTab?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab }) => {
	const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]?.id || '');

	const handleKeyDown = (e: React.KeyboardEvent, tabId: string): void => {
		const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
		let newIndex = currentIndex;

		if (e.key === 'ArrowLeft') {
			newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
		} else if (e.key === 'ArrowRight') {
			newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (!tabs.find(tab => tab.id === tabId)?.disabled) {
				setActiveTab(tabId);
			}
			return;
		} else {
			return;
		}

		e.preventDefault();
		const newTab = tabs[newIndex];
		if (!newTab.disabled) {
			setActiveTab(newTab.id);
		}
	};

	const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

	return (
		<div className="w-full">
			<div className="border-b border-gray-200">
				<nav className="flex space-x-8" role="tablist">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							role="tab"
							aria-selected={activeTab === tab.id}
							aria-controls={`panel-${tab.id}`}
							disabled={tab.disabled}
							className={`py-2 px-1 border-b-2 font-medium text-sm focus:outline-none ${
								activeTab === tab.id
									? 'border-blue-500 text-blue-600'
									: tab.disabled
									? 'border-transparent text-gray-400 cursor-not-allowed'
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
							}`}
							onClick={() => !tab.disabled && setActiveTab(tab.id)}
							onKeyDown={(e) => handleKeyDown(e, tab.id)}
							tabIndex={activeTab === tab.id ? 0 : -1}
						>
							{tab.label}
						</button>
					))}
				</nav>
			</div>
			<div
				id={`panel-${activeTab}`}
				role="tabpanel"
				aria-labelledby={activeTab}
				className="py-4"
			>
				{activeTabContent}
			</div>
		</div>
	);
};

// 36. Avatar Component
interface AvatarProps {
	src?: string;
	name: string;
	size?: 'sm' | 'md' | 'lg';
	showStatus?: boolean;
	isOnline?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', showStatus = false, isOnline = false }) => {
	const [imageError, setImageError] = useState<boolean>(false);

	const sizeClasses = {
		sm: 'w-8 h-8 text-sm',
		md: 'w-12 h-12 text-base',
		lg: 'w-16 h-16 text-xl'
	};

	const statusSizes = {
		sm: 'w-2 h-2',
		md: 'w-3 h-3',
		lg: 'w-4 h-4'
	};

	const getInitials = (fullName: string): string => {
		return fullName
			.split(' ')
			.map(name => name.charAt(0))
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	const handleImageError = (): void => {
		setImageError(true);
	};

	return (
		<div className="relative inline-block">
			<div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-300 flex items-center justify-center`}>
				{src && !imageError ? (
					<img
						src={src}
						alt={name}
						className="w-full h-full object-cover"
						onError={handleImageError}
					/>
				) : (
					<span className="font-medium text-gray-700">
						{getInitials(name)}
					</span>
				)}
			</div>
			{showStatus && (
				<div
					className={`absolute bottom-0 right-0 ${statusSizes[size]} rounded-full border-2 border-white ${
						isOnline ? 'bg-green-400' : 'bg-gray-400'
					}`}
				/>
			)}
		</div>
	);
};

// 37. Badge Component
interface BadgeProps {
	children: React.ReactNode;
	variant?: 'solid' | 'outline' | 'soft';
	color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
	size?: 'sm' | 'md' | 'lg';
	removable?: boolean;
	onRemove?: () => void;
	icon?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
	children,
	variant = 'solid',
	color = 'blue',
	size = 'md',
	removable = false,
	onRemove,
	icon
}) => {
	const baseClasses = 'inline-flex items-center font-medium rounded-full';

	const sizeClasses = {
		sm: 'px-2 py-0.5 text-xs',
		md: 'px-2.5 py-0.5 text-sm',
		lg: 'px-3 py-1 text-base'
	};

	const colorVariantClasses = {
		solid: {
			blue: 'bg-blue-500 text-white',
			green: 'bg-green-500 text-white',
			red: 'bg-red-500 text-white',
			yellow: 'bg-yellow-500 text-white',
			gray: 'bg-gray-500 text-white'
		},
		outline: {
			blue: 'border border-blue-500 text-blue-500',
			green: 'border border-green-500 text-green-500',
			red: 'border border-red-500 text-red-500',
			yellow: 'border border-yellow-500 text-yellow-500',
			gray: 'border border-gray-500 text-gray-500'
		},
		soft: {
			blue: 'bg-blue-100 text-blue-800',
			green: 'bg-green-100 text-green-800',
			red: 'bg-red-100 text-red-800',
			yellow: 'bg-yellow-100 text-yellow-800',
			gray: 'bg-gray-100 text-gray-800'
		}
	};

	const classes = `${baseClasses} ${sizeClasses[size]} ${colorVariantClasses[variant][color]}`;

	return (
		<span className={classes}>
			{icon && <span className="mr-1">{icon}</span>}
			{children}
			{removable && onRemove && (
				<button
					onClick={onRemove}
					className="ml-1 hover:opacity-70 focus:outline-none"
				>
					×
				</button>
			)}
		</span>
	);
};

// Demo Component
const EasyChallengesDemo: React.FC = () => {
	const [notifications, setNotifications] = useState<Array<{id: string; type: 'success' | 'error' | 'warning' | 'info'; message: string}>>([]);

	const accordionItems: AccordionItem[] = [
		{ id: '1', title: 'What is React?', content: 'React is a JavaScript library for building user interfaces.' },
		{ id: '2', title: 'What is TypeScript?', content: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.' },
		{ id: '3', title: 'What are React Hooks?', content: 'Hooks are functions that let you use state and other React features in functional components.' }
	];

	const breadcrumbItems: BreadcrumbItem[] = [
		{ label: 'Home', href: '/' },
		{ label: 'Products', href: '/products' },
		{ label: 'Electronics', href: '/products/electronics' },
		{ label: 'Laptops', isActive: true }
	];

	const tabs: Tab[] = [
		{ id: 'tab1', label: 'Overview', content: <div>Overview content here</div> },
		{ id: 'tab2', label: 'Details', content: <div>Detailed information</div> },
		{ id: 'tab3', label: 'Reviews', content: <div>Customer reviews</div> },
		{ id: 'tab4', label: 'Disabled', content: <div>This tab is disabled</div>, disabled: true }
	];

	const addNotification = (type: 'success' | 'error' | 'warning' | 'info'): void => {
		const messages = {
			success: 'Operation completed successfully!',
			error: 'Something went wrong. Please try again.',
			warning: 'Please check your input before proceeding.',
			info: 'Here is some useful information.'
		};

		const notification = {
			id: Date.now().toString(),
			type,
			message: messages[type]
		};

		setNotifications(prev => [...prev, notification]);
	};

	const removeNotification = (id: string): void => {
		setNotifications(prev => prev.filter(n => n.id !== id));
	};

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-8">
			<h1 className="text-3xl font-bold text-center mb-8">Easy React TypeScript Challenges</h1>

			{/* Notifications */}
			<div className="fixed top-4 right-4 space-y-2 z-50">
				{notifications.map(notification => (
					<Notification
						key={notification.id}
						type={notification.type}
						message={notification.message}
						onClose={() => removeNotification(notification.id)}
					/>
				))}
			</div>

			{/* Accordion */}
			<div className="space-y-4">
				<h2 className="text-xl font-bold">31. Accordion Component</h2>
				<Accordion items={accordionItems} />
			</div>

			{/* Breadcrumb */}
			<div className="space-y-4">
				<h2 className="text-xl font-bold">32. Breadcrumb Navigation</h2>
				<Breadcrumb items={breadcrumbItems} />
			</div>

			{/* Loading Spinners */}
			<div className="space-y-4">
				<h2 className="text-xl font-bold">33. Loading Spinner Component</h2>
				<div className="grid grid-cols-3 gap-4 p-4 border rounded">
					<div className="text-center">
						<LoadingSpinner size="sm" type="spinner" label="Small Spinner" />
					</div>
					<div className="text-center">
						<LoadingSpinner size="md" type="dots" color="green" label="Medium Dots" />
					</div>
					<div className="text-center">
						<LoadingSpinner size="lg" type="bars" color="red" label="Large Bars" />
					</div>
				</div>
			</div>

			{/* Notifications Demo */}
			<div className="space-y-4">
				<h2 className="text-xl font-bold">34. Notification/Toast Component</h2>
				<div className="flex space-x-2">
					<button onClick={() => addNotification('success')} className="px-3 py-1 bg-green-500 text-white rounded">Success</button>
					<button onClick={() => addNotification('error')} className="px-3 py-1 bg-red-500 text-white rounded">Error</button>
					<button onClick={() => addNotification('warning')} className="px-3 py-1 bg-yellow-500 text-white rounded">Warning</button>
					<button onClick={() => addNotification('info')} className="px-3 py-1 bg-blue-500 text-white rounded">Info</button>
				</div>
			</div>

			{/* Tabs */}
			<div className="space-y-4">
				<h2 className="text-xl font-bold">35. Tabs Component</h2>
				<Tabs tabs={tabs} />
			</div>

			{/* Avatar */}
			<div className="space-y-4">
				<h2 className="text-xl font-bold">36. Avatar Component</h2>
				<div className="flex items-center space-x-4">
					<Avatar name="John Doe" size="sm" showStatus isOnline />
					<Avatar name="Jane Smith" size="md" showStatus />
					<Avatar src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" name="Mike Johnson" size="lg" showStatus isOnline />
				</div>
			</div>

			{/* Badges */}
			<div className="space-y-4">
				<h2 className="text-xl font-bold">37. Badge Component</h2>
				<div className="flex flex-wrap gap-2">
					<Badge variant="solid" color="blue">Solid Blue</Badge>
					<Badge variant="outline" color="green">Outline Green</Badge>
					<Badge variant="soft" color="red" removable onRemove={() => alert('Badge removed!')}>Removable</Badge>
					<Badge variant="solid" color="yellow" icon="⭐">With Icon</Badge>
				</div>
			</div>
		</div>
	);
};

export default EasyChallengesDemo;
