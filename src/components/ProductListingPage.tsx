import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Star, ShoppingCart, Heart, Grid, List } from 'lucide-react';

// Product interface
interface Product {
	id: number;
	name: string;
	price: number;
	originalPrice?: number;
	category: string;
	brand: string;
	rating: number;
	reviews: number;
	image: string;
	description: string;
	inStock: boolean;
	isNew?: boolean;
	isFeatured?: boolean;
}

// Mock API function to simulate fetching products
const fetchProducts = async (): Promise<Product[]> => {
	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 1000));

	return [
		{
			id: 1,
			name: "Wireless Bluetooth Headphones",
			price: 89.99,
			originalPrice: 129.99,
			category: "Electronics",
			brand: "TechSound",
			rating: 4.5,
			reviews: 234,
			image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
			description: "Premium wireless headphones with noise cancellation",
			inStock: true,
			isNew: true,
			isFeatured: true
		},
		{
			id: 2,
			name: "Smartphone Case - Clear",
			price: 24.99,
			category: "Accessories",
			brand: "ProtectMax",
			rating: 4.2,
			reviews: 156,
			image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=300&h=300&fit=crop",
			description: "Crystal clear protection for your smartphone",
			inStock: true
		},
		{
			id: 3,
			name: "Gaming Mechanical Keyboard",
			price: 149.99,
			originalPrice: 199.99,
			category: "Electronics",
			brand: "GamePro",
			rating: 4.8,
			reviews: 89,
			image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop",
			description: "RGB mechanical keyboard for gaming enthusiasts",
			inStock: true,
			isFeatured: true
		},
		{
			id: 4,
			name: "Cotton T-Shirt - Blue",
			price: 19.99,
			category: "Clothing",
			brand: "ComfortWear",
			rating: 4.0,
			reviews: 312,
			image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
			description: "100% cotton comfortable t-shirt",
			inStock: true,
			isNew: true
		},
		{
			id: 5,
			name: "Coffee Maker - Premium",
			price: 299.99,
			category: "Home & Kitchen",
			brand: "BrewMaster",
			rating: 4.6,
			reviews: 78,
			image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
			description: "Professional grade coffee maker with timer",
			inStock: false
		},
		{
			id: 6,
			name: "Running Shoes - Black",
			price: 79.99,
			originalPrice: 99.99,
			category: "Sports",
			brand: "RunFast",
			rating: 4.3,
			reviews: 445,
			image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
			description: "Lightweight running shoes for athletes",
			inStock: true
		},
		{
			id: 7,
			name: "Desk Lamp - LED",
			price: 45.99,
			category: "Home & Kitchen",
			brand: "BrightLight",
			rating: 4.1,
			reviews: 167,
			image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
			description: "Adjustable LED desk lamp with USB charging",
			inStock: true,
			isNew: true
		},
		{
			id: 8,
			name: "Bluetooth Speaker",
			price: 59.99,
			category: "Electronics",
			brand: "SoundWave",
			rating: 4.4,
			reviews: 298,
			image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
			description: "Portable Bluetooth speaker with bass boost",
			inStock: true,
			isFeatured: true
		}
	];
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

// Filter interface
interface Filters {
	searchTerm: string;
	category: string;
	brand: string;
	minPrice: number;
	maxPrice: number;
	minRating: number;
	inStockOnly: boolean;
	sortBy: 'name' | 'price' | 'rating' | 'newest';
	sortOrder: 'asc' | 'desc';
}

const ProductListingPage: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [showFilters, setShowFilters] = useState(false);

	const [filters, setFilters] = useState<Filters>({
		searchTerm: '',
		category: '',
		brand: '',
		minPrice: 0,
		maxPrice: 1000,
		minRating: 0,
		inStockOnly: false,
		sortBy: 'name',
		sortOrder: 'asc'
	});

	// Debounce search term for better performance
	const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

	// Fetch products on component mount
	useEffect(() => {
		const loadProducts = async () => {
			try {
				setLoading(true);
				const fetchedProducts = await fetchProducts();
				setProducts(fetchedProducts);
			} catch (err) {
				setError('Failed to fetch products');
			} finally {
				setLoading(false);
			}
		};

		loadProducts();
	}, []);

	// Get unique categories and brands for filter options
	const { categories, brands } = useMemo(() => {
		const categories = [...new Set(products.map(p => p.category))];
		const brands = [...new Set(products.map(p => p.brand))];
		return { categories, brands };
	}, [products]);

	// Filter and sort products
	const filteredProducts = useMemo(() => {
		const filtered = products.filter(product => {
			const matchesSearch = product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
													 product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
			const matchesCategory = !filters.category || product.category === filters.category;
			const matchesBrand = !filters.brand || product.brand === filters.brand;
			const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice;
			const matchesRating = product.rating >= filters.minRating;
			const matchesStock = !filters.inStockOnly || product.inStock;

			return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesRating && matchesStock;
		});

		// Sort products
		filtered.sort((a, b) => {
			let comparison = 0;

			switch (filters.sortBy) {
				case 'name':
					comparison = a.name.localeCompare(b.name);
					break;
				case 'price':
					comparison = a.price - b.price;
					break;
				case 'rating':
					comparison = a.rating - b.rating;
					break;
				case 'newest':
					comparison = (a.isNew ? 1 : 0) - (b.isNew ? 1 : 0);
					break;
			}

			return filters.sortOrder === 'desc' ? -comparison : comparison;
		});

		return filtered;
	}, [products, debouncedSearchTerm, filters]);

	const updateFilter = (key: keyof Filters, value: any) => {
		setFilters(prev => ({ ...prev, [key]: value }));
	};

	const clearFilters = () => {
		setFilters({
			searchTerm: '',
			category: '',
			brand: '',
			minPrice: 0,
			maxPrice: 1000,
			minRating: 0,
			inStockOnly: false,
			sortBy: 'name',
			sortOrder: 'asc'
		});
	};

	const renderStars = (rating: number) => {
		return Array.from({ length: 5 }, (_, i) => (
			<Star
				key={i}
				size={16}
				className={`${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
			/>
		));
	};

	const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
		<div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${viewMode === 'list' ? 'flex' : ''}`}>
			<div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
				<img
					src={product.image}
					alt={product.name}
					className={`object-cover ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'}`}
				/>
				{product.isNew && (
					<span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs rounded">New</span>
				)}
				{product.isFeatured && (
					<span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs rounded">Featured</span>
				)}
				{!product.inStock && (
					<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
						<span className="text-white font-semibold">Out of Stock</span>
					</div>
				)}
			</div>

			<div className="p-4 flex-1">
				<div className="flex justify-between items-start mb-2">
					<h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
					<button className="text-gray-400 hover:text-red-500 transition-colors">
						<Heart size={20} />
					</button>
				</div>

				<p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>

				<div className="flex items-center gap-1 mb-2">
					{renderStars(product.rating)}
					<span className="text-sm text-gray-600 ml-1">({product.reviews})</span>
				</div>

				<div className="flex items-center gap-2 mb-3">
					<span className="text-xl font-bold text-green-600">${product.price}</span>
					{product.originalPrice && (
						<span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
					)}
				</div>

				<div className="flex gap-2">
					<button
						disabled={!product.inStock}
						className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						<ShoppingCart size={16} />
						Add to Cart
					</button>
				</div>
			</div>
		</div>
	);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading products...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-600 mb-4">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<h1 className="text-2xl font-bold text-gray-900">Products</h1>
					<p className="text-gray-600">Discover our amazing collection</p>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 py-6">
				<div className="flex gap-6">
					{/* Filters Sidebar */}
					<div className={`bg-white rounded-lg shadow-md p-6 ${showFilters ? 'block' : 'hidden'} lg:block lg:w-80 flex-shrink-0`}>
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-semibold">Filters</h2>
							<button
								onClick={clearFilters}
								className="text-sm text-blue-600 hover:text-blue-800"
							>
								Clear All
							</button>
						</div>

						{/* Search */}
						<div className="mb-6">
							<label className="block text-sm font-medium mb-2">Search</label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
								<input
									type="text"
									placeholder="Search products..."
									value={filters.searchTerm}
									onChange={(e) => updateFilter('searchTerm', e.target.value)}
									className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
						</div>

						{/* Category */}
						<div className="mb-6">
							<label className="block text-sm font-medium mb-2">Category</label>
							<select
								value={filters.category}
								onChange={(e) => updateFilter('category', e.target.value)}
								className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="">All Categories</option>
								{categories.map(category => (
									<option key={category} value={category}>{category}</option>
								))}
							</select>
						</div>

						{/* Brand */}
						<div className="mb-6">
							<label className="block text-sm font-medium mb-2">Brand</label>
							<select
								value={filters.brand}
								onChange={(e) => updateFilter('brand', e.target.value)}
								className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="">All Brands</option>
								{brands.map(brand => (
									<option key={brand} value={brand}>{brand}</option>
								))}
							</select>
						</div>

						{/* Price Range */}
						<div className="mb-6">
							<label className="block text-sm font-medium mb-2">Price Range</label>
							<div className="flex gap-2">
								<input
									type="number"
									placeholder="Min"
									value={filters.minPrice}
									onChange={(e) => updateFilter('minPrice', Number(e.target.value))}
									className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
								<input
									type="number"
									placeholder="Max"
									value={filters.maxPrice}
									onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
									className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
						</div>

						{/* Rating */}
						<div className="mb-6">
							<label className="block text-sm font-medium mb-2">Minimum Rating</label>
							<select
								value={filters.minRating}
								onChange={(e) => updateFilter('minRating', Number(e.target.value))}
								className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value={0}>All Ratings</option>
								<option value={4}>4+ Stars</option>
								<option value={3}>3+ Stars</option>
								<option value={2}>2+ Stars</option>
								<option value={1}>1+ Stars</option>
							</select>
						</div>

						{/* In Stock Only */}
						<div className="mb-6">
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={filters.inStockOnly}
									onChange={(e) => updateFilter('inStockOnly', e.target.checked)}
									className="mr-2"
								/>
								<span className="text-sm">In stock only</span>
							</label>
						</div>
					</div>

					{/* Main Content */}
					<div className="flex-1">
						{/* Controls */}
						<div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
							<div className="flex items-center gap-4">
								<button
									onClick={() => setShowFilters(!showFilters)}
									className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
								>
									<Filter size={16} />
									Filters
								</button>

								<span className="text-sm text-gray-600">
									{filteredProducts.length} products found
								</span>
							</div>

							<div className="flex items-center gap-4">
								{/* Sort */}
								<div className="flex items-center gap-2">
									<label className="text-sm font-medium">Sort by:</label>
									<select
										value={`${filters.sortBy}-${filters.sortOrder}`}
										onChange={(e) => {
											const [sortBy, sortOrder] = e.target.value.split('-');
											updateFilter('sortBy', sortBy);
											updateFilter('sortOrder', sortOrder);
										}}
										className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									>
										<option value="name-asc">Name A-Z</option>
										<option value="name-desc">Name Z-A</option>
										<option value="price-asc">Price Low-High</option>
										<option value="price-desc">Price High-Low</option>
										<option value="rating-desc">Rating High-Low</option>
										<option value="newest-desc">Newest First</option>
									</select>
								</div>

								{/* View Mode */}
								<div className="flex border rounded-lg">
									<button
										onClick={() => setViewMode('grid')}
										className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
									>
										<Grid size={16} />
									</button>
									<button
										onClick={() => setViewMode('list')}
										className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
									>
										<List size={16} />
									</button>
								</div>
							</div>
						</div>

						{/* Products Grid/List */}
						{filteredProducts.length === 0 ? (
							<div className="bg-white rounded-lg shadow-md p-12 text-center">
								<p className="text-gray-600 mb-4">No products found matching your criteria</p>
								<button
									onClick={clearFilters}
									className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
								>
									Clear Filters
								</button>
							</div>
						) : (
							<div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
								{filteredProducts.map(product => (
									<ProductCard key={product.id} product={product} />
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductListingPage;
