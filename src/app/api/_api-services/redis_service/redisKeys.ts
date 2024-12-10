// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const getPwdResetTokenKey = (userId: number): string => `PRT-${userId}`;
export const getEmailVerificationTokenKey = (token: string): string => `EVT-${token}`;
export const get2FAKey = (userId: number): string => `TFA-${userId}`;
export const getSubscanDataKey = (network: string, url: string): string => `SDT-${network}-${url}`;
export const getRefreshTokenKey = (userId: number): string => `RFT-${userId}`;
