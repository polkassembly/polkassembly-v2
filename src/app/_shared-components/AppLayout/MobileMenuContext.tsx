// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

interface MobileMenuContextType {
	isNavbarMenuOpen: boolean;
	setIsNavbarMenuOpen: (open: boolean) => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
	const [isNavbarMenuOpen, setIsNavbarMenuOpen] = useState(false);
	const value = useMemo(() => ({ isNavbarMenuOpen, setIsNavbarMenuOpen }), [isNavbarMenuOpen]);

	return <MobileMenuContext.Provider value={value}>{children}</MobileMenuContext.Provider>;
}

export function useMobileMenu() {
	const context = useContext(MobileMenuContext);
	if (!context) {
		throw new Error('useMobileMenu must be used within MobileMenuProvider');
	}
	return context;
}
