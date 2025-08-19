import { useState } from "react";

interface CounterHistory {
	value: number;
	timestamp: Date;
}

const CounterWithHistory: React.FC = () => {
	const [count, setCount] = useState<number>(0);
	const [history, setHistory] = useState<CounterHistory[]>([
		{
			value: 0,
			timestamp: new Date()
		}
	]);

	const increment = ():void => {
		const newValue = count + 1;
		setCount(newValue);
		setHistory(prev => [...prev, {
			value: newValue,
			timestamp: new Date()
		}])
	}

	const decrement = (): void => {
		const newValue = count - 1;
		setCount(newValue);
		setHistory(prev => [...prev, {
			value: newValue,
			timestamp: new Date()
		}])
	}

	const resetToValue = (value: number): void => {
		setCount(value);
		setHistory(prev => [...prev, { value, timestamp: new Date()}])
	}

	return (
		<div className="p-4 border rounded-lg mb-4">
			<h3 className="text-lg font-bold mb-2">Counter with History</h3>
			<div className="mb-4">
				<span className="text-2xl font-bold mr-4">Count: {count}</span>
				<button onClick={increment} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">+</button>
				<button onClick={decrement} className="bg-red-500 text-white px-3 py-1 rounded">-</button>
			</div>
			<div>
				<h4 className="font-semibold mb-2">History:</h4>
				<div className="max-h-40 overflow-y-auto flex flex-col gap-2">
					{history.map((entry, index) => (
						<div key={index} className='flex flex-nowrap gap-2'>
							<span>{ entry.value }</span>
							<span>{ entry.timestamp.toLocaleTimeString() }</span>
							<button className='px-2 bg-black text-white rounded-sm' onClick={() => resetToValue(entry.value)}>Reset to this value</button>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
export default CounterWithHistory;
