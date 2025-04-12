// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { ToastActionElement, ToastProps } from '@ui/Toaster/Toast';
import { ENotificationStatus } from '@/_shared/types';
import { ReactNode, useEffect, useState } from 'react';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
	id: string;
	title?: ReactNode;
	description?: ReactNode;
	action?: ToastActionElement;
	status?: ENotificationStatus;
	variant?: ENotificationStatus;
};

type ActionType = {
	ADD_TOAST: 'ADD_TOAST';
	UPDATE_TOAST: 'UPDATE_TOAST';
	DISMISS_TOAST: 'DISMISS_TOAST';
	REMOVE_TOAST: 'REMOVE_TOAST';
};

type Action =
	| { type: ActionType['ADD_TOAST']; toast: ToasterToast }
	| { type: ActionType['UPDATE_TOAST']; toast: Partial<ToasterToast> }
	| { type: ActionType['DISMISS_TOAST']; toastId?: ToasterToast['id'] }
	| { type: ActionType['REMOVE_TOAST']; toastId?: ToasterToast['id'] };

interface State {
	toasts: ToasterToast[];
}

// Initialize state and listeners at the top level
const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };
let count = 0;

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function genId(): string {
	count = (count + 1) % Number.MAX_SAFE_INTEGER;
	return count.toString();
}

let addToRemoveQueue: (toastId: string) => void;

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
		case 'ADD_TOAST':
			return {
				...state,
				toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
			};

		case 'UPDATE_TOAST':
			return {
				...state,
				toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t))
			};

		case 'DISMISS_TOAST': {
			const { toastId } = action;

			if (toastId) {
				addToRemoveQueue(toastId);
			} else {
				state.toasts.forEach(({ id }) => {
					addToRemoveQueue(id);
				});
			}

			return {
				...state,
				toasts: state.toasts.map((t) => (t.id === toastId || toastId === undefined ? { ...t, open: false } : t))
			};
		}
		case 'REMOVE_TOAST':
			if (action.toastId === undefined) {
				return { ...state, toasts: [] };
			}
			return {
				...state,
				toasts: state.toasts.filter((t) => t.id !== action.toastId)
			};
		default:
			return state;
	}
};

const dispatch = (action: Action): void => {
	memoryState = reducer(memoryState, action);
	listeners.forEach((listener) => {
		listener(memoryState);
	});
};

addToRemoveQueue = (toastId: string): void => {
	if (toastTimeouts.has(toastId)) {
		return;
	}

	const timeout = setTimeout(() => {
		toastTimeouts.delete(toastId);
		dispatch({
			type: 'REMOVE_TOAST',
			toastId
		});
	}, TOAST_REMOVE_DELAY);

	toastTimeouts.set(toastId, timeout);
};

type Toast = Omit<ToasterToast, 'id'>;

function toast({ duration = 3, status, ...props }: Toast) {
	const id = genId();

	const update = (toastProps: ToasterToast) =>
		dispatch({
			type: 'UPDATE_TOAST',
			toast: { ...toastProps, id }
		});

	const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

	dispatch({
		type: 'ADD_TOAST',
		toast: {
			...props,
			duration: duration * 1000,
			status,
			variant: status,
			id,
			open: true,
			onOpenChange: (open: boolean) => {
				if (!open) dismiss();
			}
		}
	});

	return {
		id,
		dismiss,
		update
	};
}

function useToast() {
	const [state, setState] = useState<State>(memoryState);

	useEffect(() => {
		listeners.push(setState);
		return () => {
			const index = listeners.indexOf(setState);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		};
	}, [state]);

	return {
		...state,
		toast,
		dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId })
	};
}

export { useToast };
