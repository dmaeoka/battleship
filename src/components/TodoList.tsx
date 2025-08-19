import { useState, useEffect } from "react";
import { useLocalStorage, useDebounce } from '../hooks';

interface TodoProps {
	id: number;
	name: string;
	completed: boolean;
}

export default function TodoList() {
	const [inputValue, setInputValue] = useState<string>("");
	const [storedValue, setStoredValue] = useLocalStorage("todo","");
	const [todos, setTodos] = useState<TodoProps[]>(() => JSON.parse(storedValue));
	const debouncedValue = useDebounce(inputValue, 500);

	const addTodo = (): void => {
		if (inputValue.trim() !== "") {
			const newTodo = [...todos, {
				id: Date.now(),
				name: inputValue.trim(),
				completed: false
			}];
			setTodos(newTodo);
			setStoredValue(JSON.stringify(newTodo));
			setInputValue("");
		}
	}

	const toggleTodo = (id: number):void => {
		if (id) {
			const newTodo = todos.map(todo =>
				todo.id === id ? {...todo, completed: !todo.completed} : todo
			)
			setTodos(newTodo);
			setStoredValue(JSON.stringify(newTodo));
		}
	}

	useEffect(() => {
		if (debouncedValue) {
			window.console.log("Searching for " + debouncedValue);
		}
	},[debouncedValue])

	return (
		<div className="mb-4">
			<div className="flex flex-nowrap gap-2">
				<input
					name="todoItem"
					value={inputValue}
					onChange={e => setInputValue(e.target.value)}
					className="border border-secondary rounded-sm py-2 px-4"
				/>
				<button onClick={() => addTodo()} className="bg-gray-300 text-gray-900 px-4 rounded-sm">
					Add todo
				</button>
			</div>
			<p>Current input: {inputValue}</p>
			<p>Debounced Value input: {debouncedValue}</p>
			<ul>
				{todos && todos.map(todo => {
					return (
						<li key={todo.id} onClick={() => toggleTodo(todo.id)}>
							{todo.completed ? '✅' : '❌'}
							{todo.name}
						</li>
					)
				})}
			</ul>
		</div>
	)
}
