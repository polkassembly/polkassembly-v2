import { NextResponse } from 'next/server';

export async function GET() {
	const todos = [
		{ id: 1, title: 'Learn React Query' },
		{ id: 2, title: 'Build a Next.js app' },
		{ id: 3, title: 'Profit' },
		{ id: 4, title: 'Take a break' }
	];

	return NextResponse.json(todos);
}
