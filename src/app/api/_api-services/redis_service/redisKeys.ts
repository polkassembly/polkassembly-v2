// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const getPwdResetTokenKey = (userId: number): string => `PRT-${userId}`;
export const getAddressLoginKey = (address: string): string => `ALN-${address}`;
export const getAddressSignupKey = (address: string): string => `ASU-${address}`;
export const getSetCredentialsKey = (address: string): string => `SCR-${address}`;
export const getEmailVerificationTokenKey = (token: string): string => `EVT-${token}`;
export const getMultisigAddressKey = (address: string): string => `MLA-${address}`;
export const getCreatePostKey = (address: string): string => `CPT-${address}`;
export const getEditPostKey = (address: string): string => `EPT-${address}`;
export const get2FAKey = (userId: number): string => `TFA-${userId}`;
