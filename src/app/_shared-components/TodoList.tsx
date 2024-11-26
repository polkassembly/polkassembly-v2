'use client';

import { useQuery } from '@tanstack/react-query';

const fetchTodos = async () => {
	const response = await fetch('/api/v2/todos');
	if (!response.ok) {
		throw new Error('Failed to fetch todos');
	}
	return response.json();
};

function TodoList() {
	const { data, isLoading, error } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos });

	if (isLoading) return <p>Loading...</p>;
	if (error instanceof Error) return <p>Error: {error.message}</p>;

	return (
		<ul>
			{data.map((todo: { id: number; title: string }) => (
				<li key={todo.id}>{todo.title}</li>
			))}
		</ul>
	);
}

export default TodoList;
