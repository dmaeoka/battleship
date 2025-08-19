import { useState, useRef, useEffect, useMemo, useContext } from 'react';
import { GameContext } from '../context/GameContext';

interface AutocompleteOption {
	id: string;
	label: string;
}

interface AutocompleteProps {
	options: AutocompleteOption[];
	onSelect: (option: AutocompleteOption) => void;
	placeholder?: string;
	fetchSuggestions?: (query: string) => Promise<AutocompleteOption[]>;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
	options,
	onSelect,
	placeholder = "Search...",
	fetchSuggestions
}) => {
	const [query, setQuery] = useState<string>('');
	const [suggestions, setSuggestions] = useState<AutocompleteOption[]>([]);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [selectedIndex, setSelectedIndex] = useState<number>(-1);
	const [loading, setLoading] = useState<boolean>(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLUListElement>(null);

	// Debounced search
	useEffect(() => {
		const timer = setTimeout(async () => {
			if (query.trim()) {
				setLoading(true);
				try {
					if (fetchSuggestions) {
						const results = await fetchSuggestions(query);
						setSuggestions(results);
					} else {
						const filtered = options.filter(option =>
							option.label.toLowerCase().includes(query.toLowerCase())
						);
						setSuggestions(filtered);
					}
				} catch (error) {
					console.error('Error fetching suggestions:', error);
					setSuggestions([]);
				} finally {
					setLoading(false);
				}
				setIsOpen(true);
				setSelectedIndex(-1);
			} else {
				setSuggestions([]);
				setIsOpen(false);
			}
		}, 300);
		return () => clearTimeout(timer);
	}, [query, options, fetchSuggestions]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
		if (!isOpen) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				setSelectedIndex(prev =>
					prev < suggestions.length - 1 ? prev + 1 : prev
				);
				break;
			case 'ArrowUp':
				e.preventDefault();
				setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
				break;
			case 'Enter':
				e.preventDefault();
				if (selectedIndex >= 0 && suggestions[selectedIndex]) {
					handleSelect(suggestions[selectedIndex]);
				}
				break;
			case 'Escape':
				setIsOpen(false);
				setSelectedIndex(-1);
				break;
		}
	};

	const handleSelect = (option: AutocompleteOption): void => {
		setQuery("");
		setIsOpen(false);
		setSelectedIndex(-1);
		onSelect(option);
	};

	return (
		<div className="relative mb-4">
			<h3 className="text-lg font-bold mb-2">Autocomplete -{JSON.stringify(isOpen)}-</h3>
			<input
				ref={inputRef}
				type="text"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>

			{isOpen && (
				<ul
					ref={listRef}
					className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto"
				>
					{loading ? (
						<li className="p-2 text-gray-500">Loading...</li>
					) : suggestions.length > 0 ? (
						suggestions.map((option, index) => (
							<li
								key={option.id}
								onClick={() => handleSelect(option)}
								className={`p-2 cursor-pointer hover:bg-gray-100 ${
									index === selectedIndex ? 'bg-blue-100' : ''
								}`}
							>
								{option.label}
							</li>
						))
					) : (
						<li className="p-2 text-gray-500">No results found</li>
					)}
				</ul>
			)}
		</div>
	);
};

// 7. Data Table with Sorting
interface TableColumn<T> {
	key: keyof T;
	label: string;
	sortable?: boolean;
	render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
	data: T[];
	columns: TableColumn<T>[];
	onRowSelect?: (row: T) => void;
	selectedRows?: T[];
	pageSize?: number;
}

type SortDirection = 'asc' | 'desc' | null;

function DataTable<T extends { id: string | number }>({
	data,
	columns,
	onRowSelect,
	selectedRows = [],
	pageSize = 5
}: DataTableProps<T>) {
	const [sortKey, setSortKey] = useState<keyof T | null>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>(null);
	const [currentPage, setCurrentPage] = useState<number>(1);

	const sortedData = useMemo(() => {
		if (!sortKey || !sortDirection) return data;

		return [...data].sort((a, b) => {
			const aVal = a[sortKey];
			const bVal = b[sortKey];

			if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
	}, [data, sortKey, sortDirection]);

	const paginatedData = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return sortedData.slice(start, start + pageSize);
	}, [sortedData, currentPage, pageSize]);

	const totalPages = Math.ceil(sortedData.length / pageSize);

	const handleSort = (key: keyof T): void => {
		if (sortKey === key) {
			setSortDirection(prev =>
				prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
			);
			if (sortDirection === 'desc') {
				setSortKey(null);
			}
		} else {
			setSortKey(key);
			setSortDirection('asc');
		}
	};

	const isSelected = (row: T): boolean => {
		return selectedRows.some(selected => selected.id === row.id);
	};

	return (
		<div className="mb-4">
			<h3 className="text-lg font-bold mb-2">Data Table with Sorting</h3>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse border border-gray-300">
					<thead>
						<tr className="bg-gray-100">
							{columns.map((column) => (
								<th
									key={String(column.key)}
									className={`border border-gray-300 px-4 py-2 text-left ${
										column.sortable ? 'cursor-pointer hover:bg-gray-200' : ''
									}`}
									onClick={() => column.sortable && handleSort(column.key)}
								>
									<div className="flex items-center justify-between">
										{column.label}
										{column.sortable && (
											<span className="ml-2">
												{sortKey === column.key ? (
													sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'
												) : '↕'}
											</span>
										)}
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{paginatedData.map((row) => (
							<tr
								key={row.id}
								className={`hover:bg-gray-50 ${isSelected(row) ? 'bg-blue-50' : ''} ${
									onRowSelect ? 'cursor-pointer' : ''
								}`}
								onClick={() => onRowSelect && onRowSelect(row)}
							>
								{columns.map((column) => (
									<td key={String(column.key)} className="border border-gray-300 px-4 py-2">
										{column.render
											? column.render(row[column.key], row)
											: String(row[column.key])
										}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex justify-between items-center mt-4">
				<div className="text-sm text-gray-600">
					Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
				</div>
				<div className="flex space-x-2">
					<button
						onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
						disabled={currentPage === 1}
						className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Previous
					</button>
					<span className="px-3 py-1">
						Page {currentPage} of {totalPages}
					</span>
					<button
						onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
						disabled={currentPage === totalPages}
						className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Next
					</button>
				</div>
			</div>
		</div>
	);
}

// 8. Image Gallery with Lightbox
interface GalleryImage {
	id: string;
	thumbnail: string;
	fullSize: string;
	alt: string;
}

interface ImageGalleryProps {
	images: GalleryImage[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const openLightbox = (index: number): void => {
		setSelectedIndex(index);
	};

	const closeLightbox = (): void => {
		setSelectedIndex(null);
	};

	const goToPrevious = (): void => {
		if (selectedIndex !== null) {
			setSelectedIndex(prev => prev! > 0 ? prev! - 1 : images.length - 1);
		}
	};

	const goToNext = (): void => {
		if (selectedIndex !== null) {
			setSelectedIndex(prev => prev! < images.length - 1 ? prev! + 1 : 0);
		}
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent): void => {
			if (selectedIndex === null) return;

			switch (e.key) {
				case 'Escape':
					closeLightbox();
					break;
				case 'ArrowLeft':
					goToPrevious();
					break;
				case 'ArrowRight':
					goToNext();
					break;
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [selectedIndex]);

	return (
		<div className="mb-4">
			<h3 className="text-lg font-bold mb-2">Image Gallery</h3>

			{/* Gallery Grid */}
			<div className="grid grid-cols-3 gap-4 mb-4">
				{images.map((image, index) => (
					<div
						key={image.id}
						className="aspect-square overflow-hidden rounded cursor-pointer hover:opacity-80 transition-opacity"
						onClick={() => openLightbox(index)}
					>
						<img
							src={image.thumbnail}
							alt={image.alt}
							className="w-full h-full object-cover"
						/>
					</div>
				))}
			</div>

			{/* Lightbox */}
			{selectedIndex !== null && (
				<div
					className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
					onClick={closeLightbox}
				>
					<div className="relative max-w-4xl max-h-full p-4" onClick={e => e.stopPropagation()}>
						<img
							src={images[selectedIndex].fullSize}
							alt={images[selectedIndex].alt}
							className="max-w-full max-h-full object-contain"
						/>

						{/* Navigation buttons */}
						<button
							onClick={goToPrevious}
							className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded"
						>
							←
						</button>
						<button
							onClick={goToNext}
							className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded"
						>
							→
						</button>

						{/* Close button */}
						<button
							onClick={closeLightbox}
							className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded"
						>
							✕
						</button>

						{/* Image counter */}
						<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-20 text-white px-3 py-1 rounded">
							{selectedIndex + 1} / {images.length}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

// Demo Component
const MediumSolutions: React.FC = () => {
	// Sample data for autocomplete
	const autocompleteOptions: AutocompleteOption[] = [
		{ id: '1', label: 'Apple' },
		{ id: '2', label: 'Banana' },
		{ id: '3', label: 'Cherry' },
		{ id: '4', label: 'Date' },
		{ id: '5', label: 'Elderberry' },
	];

	// Sample data for table
	const tableData = [
		{ id: 1, name: 'John Doe', email: 'john@example.com', age: 30, status: 'Active' },
		{ id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, status: 'Inactive' },
		{ id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, status: 'Active' },
		{ id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 28, status: 'Pending' },
	];

	const tableColumns: TableColumn<typeof tableData[0]>[] = [
		{ key: 'name', label: 'Name', sortable: true },
		{ key: 'email', label: 'Email', sortable: true },
		{ key: 'age', label: 'Age', sortable: true },
		{
			key: 'status',
			label: 'Status',
			sortable: true,
			render: (value: string) => (
				<span className={`px-2 py-1 rounded text-sm ${
					value === 'Active' ? 'bg-green-100 text-green-800' :
					value === 'Inactive' ? 'bg-red-100 text-red-800' :
					'bg-yellow-100 text-yellow-800'
				}`}>
					{value}
				</span>
			)
		}
	];

	// Sample images for gallery
	const galleryImages: GalleryImage[] = [
		{
			id: '1',
			thumbnail: 'https://picsum.photos/300/300?random=1',
			fullSize: 'https://picsum.photos/800/600?random=1',
			alt: 'Sample image 1'
		},
		{
			id: '2',
			thumbnail: 'https://picsum.photos/300/300?random=2',
			fullSize: 'https://picsum.photos/800/600?random=2',
			alt: 'Sample image 2'
		},
		{
			id: '3',
			thumbnail: 'https://picsum.photos/300/300?random=3',
			fullSize: 'https://picsum.photos/800/600?random=3',
			alt: 'Sample image 3'
		},
		{
			id: '4',
			thumbnail: 'https://picsum.photos/300/300?random=4',
			fullSize: 'https://picsum.photos/800/600?random=4',
			alt: 'Sample image 4'
		},
		{
			id: '5',
			thumbnail: 'https://picsum.photos/300/300?random=5',
			fullSize: 'https://picsum.photos/800/600?random=5',
			alt: 'Sample image 5'
		},
		{
			id: '6',
			thumbnail: 'https://picsum.photos/300/300?random=6',
			fullSize: 'https://picsum.photos/800/600?random=6',
			alt: 'Sample image 6'
		}
	];

	const [selectedAutocomplete, setSelectedAutocomplete] = useState<AutocompleteOption | null>(null);
	const [selectedTableRows, setSelectedTableRows] = useState<typeof tableData>([]);

	const gameContext = useContext(GameContext);
	if (!gameContext) {
		throw new Error('EasySolutions must be used within a GameProvider');
	}
	const { favouriteGame, setFavouriteGame} = gameContext;

	const handleAutocompleteSelect = (option: AutocompleteOption): void => {
		setSelectedAutocomplete(option);
	};

	const handleRowSelect = (row: typeof tableData[0]): void => {
		setSelectedTableRows(prev => {
			const isSelected = prev.some(selected => selected.id === row.id);
			if (isSelected) {
				return prev.filter(selected => selected.id !== row.id);
			} else {
				return [...prev, row];
			}
		});
	};

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-8">
			<div className='flex gap-2 items-center mb-4'>
				<span>{favouriteGame}</span>
				<button onClick={() => setFavouriteGame("DOOM!")} className="bg-red-500 text-white px-3 py-1 rounded">Change Game</button>
			</div>

			<h1 className="text-3xl font-bold text-center mb-8">Medium Level Interview Solutions</h1>

			<div className="p-4 border rounded-lg">
				<Autocomplete
					options={autocompleteOptions}
					onSelect={handleAutocompleteSelect}
					placeholder="Search fruits..."
				/>
				{selectedAutocomplete && (
					<p className="text-sm text-green-600">
						Selected: {selectedAutocomplete.label}
					</p>
				)}
			</div>

			<div className="p-4 border rounded-lg">
				<DataTable
					data={tableData}
					columns={tableColumns}
					onRowSelect={handleRowSelect}
					selectedRows={selectedTableRows}
					pageSize={3}
				/>
				{selectedTableRows.length > 0 && (
					<p className="text-sm text-blue-600 mt-2">
						Selected rows: {selectedTableRows.map(row => row.name).join(', ')}
					</p>
				)}
			</div>

			<div className="p-4 border rounded-lg">
				<ImageGallery images={galleryImages} />
			</div>
		</div>
	);
};

export default MediumSolutions;
