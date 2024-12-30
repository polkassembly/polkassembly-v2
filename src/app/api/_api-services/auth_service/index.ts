// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { APIError } from '@app/api/_api-utils/apiError';
import { ACCESS_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_COOKIE_OPTIONS } from '@app/api/_api-constants/jwt';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import {
	ACCESS_TOKEN_PASSPHRASE,
	ACCESS_TOKEN_PRIVATE_KEY,
	ACCESS_TOKEN_PUBLIC_KEY,
	REFRESH_TOKEN_PASSPHRASE,
	REFRESH_TOKEN_PRIVATE_KEY,
	REFRESH_TOKEN_PUBLIC_KEY
} from '@api/_api-constants/apiEnvVars';
import { serialize } from 'cookie';
import * as argon2 from 'argon2';
import { createId as createCuid } from '@paralleldrive/cuid2';
import { ENetwork, ERole, EWallet, IHashedPassword, IAuthResponse, IRefreshTokenPayload, IUser, IAccessTokenPayload, ECookieNames, IUserTFADetails } from '@shared/types';
import { ValidatorService } from '@shared/_services/validator_service';
import { randomBytes } from 'crypto';
import { DEFAULT_PROFILE_DETAILS } from '@shared/_constants/defaultProfileDetails';
import { getSubstrateAddress } from '@shared/_utils/getSubstrateAddress';
import { TOTP } from 'otpauth';
import { cookies } from 'next/headers';
import { OffChainDbService } from '../offchain_db_service';
import { RedisService } from '../redis_service';
import { ACCESS_TOKEN_LIFE_IN_SECONDS, REFRESH_TOKEN_LIFE_IN_SECONDS } from '../../_api-constants/timeConstants';
import { NotificationService } from '../notification_service';
import { generateRandomBase32 } from '../../_api-utils/generateRandomBase32';

if (!ACCESS_TOKEN_PRIVATE_KEY || !ACCESS_TOKEN_PUBLIC_KEY || !ACCESS_TOKEN_PASSPHRASE) {
	throw new APIError(
		ERROR_CODES.INTERNAL_SERVER_ERROR,
		StatusCodes.INTERNAL_SERVER_ERROR,
		'ACCESS_TOKEN_PRIVATE_KEY, ACCESS_TOKEN_PUBLIC_KEY or ACCESS_TOKEN_PASSPHRASE not set. Aborting.'
	);
}

if (!REFRESH_TOKEN_PRIVATE_KEY || !REFRESH_TOKEN_PUBLIC_KEY || !REFRESH_TOKEN_PASSPHRASE) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'REFRESH_TOKEN_PRIVATE_KEY or REFRESH_TOKEN_PASSPHRASE not set. Aborting.');
}

export class AuthService {
	private static async CreateAndSendEmailVerificationToken(user: IUser): Promise<void> {
		if (user.email) {
			const verifyToken = createCuid();
			await RedisService.SetEmailVerificationToken(verifyToken, user.email);

			// send verification email in background
			NotificationService.SendVerificationEmail(user, verifyToken);
		}
	}

	private static async GetSaltAndHashedPassword(plainPassword: string): Promise<IHashedPassword> {
		const salt = randomBytes(32);
		const hashedPassword = await argon2.hash(plainPassword, { salt });

		return {
			password: hashedPassword,
			salt: salt.toString('hex')
		};
	}

	private static async CreateUser({
		email,
		newPassword,
		username,
		isWeb3Signup,
		network,
		isCustomUsername = false,
		address,
		wallet
	}: {
		email: string;
		newPassword: string;
		username: string;
		isWeb3Signup: boolean;
		network: ENetwork;
		isCustomUsername: boolean;
		address?: string;
		wallet?: EWallet;
	}): Promise<IUser> {
		if (isWeb3Signup && !address) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST);
		}

		const { password, salt } = await this.GetSaltAndHashedPassword(newPassword);

		const newUserId = (await OffChainDbService.GetTotalUsersCount()) + 1;
		const newUser: IUser = {
			createdAt: new Date(),
			isCustomUsername,
			email,
			isEmailVerified: false,
			id: newUserId,
			password,
			profileDetails: DEFAULT_PROFILE_DETAILS,
			profileScore: 0,
			salt,
			username,
			isWeb3Signup,
			primaryNetwork: network
		};

		await OffChainDbService.AddNewUser(newUser);

		if (isWeb3Signup && address) {
			await OffChainDbService.AddNewAddress({
				address,
				isDefault: true,
				network,
				userId: newUserId,
				// todo: wallet || EWallet.OTHER
				wallet: wallet || EWallet.OTHER
			});
		}

		return newUser;
	}

	static GetUserIdFromAccessToken(token: string): number {
		let decoded: IAccessTokenPayload;

		try {
			decoded = jwt.verify(token, ACCESS_TOKEN_PUBLIC_KEY) as IAccessTokenPayload;
		} catch (e) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, `${(e as Error).message}`);
		}

		if (!decoded.id) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
		}

		return decoded.id;
	}

	static async GetUserWithAccessToken(token: string): Promise<IUser | null> {
		const userId = this.GetUserIdFromAccessToken(token);

		const user = await OffChainDbService.GetUserById(userId);
		if (!user) return null;

		return user;
	}

	static async GetSignedAccessToken({
		email,
		isEmailVerified,
		id,
		username,
		isWeb3Signup,
		twoFactorAuth,
		loginAddress,
		loginWallet,
		roles
	}: IUser & { loginAddress?: string; loginWallet?: EWallet }): Promise<string> {
		let defaultAddress = null;
		let addresses: string[] = [];

		try {
			const userAddresses = await OffChainDbService.GetAddressesForUserId(id);
			addresses = userAddresses.map((a) => a.address);
			defaultAddress = userAddresses.find((a) => a.default);
		} catch {
			console.log('Error getting addresses for user', id);
		}

		const allowedRoles: ERole[] = [ERole.USER, ...(roles || [])];

		let tokenContent: IAccessTokenPayload = {
			addresses: addresses || [],
			defaultAddress: defaultAddress?.address || '',
			email,
			isEmailVerified: isEmailVerified || false,
			iat: Math.floor(Date.now() / 1000),
			id,
			roles: allowedRoles,
			sub: id.toString(),
			username,
			web3signup: isWeb3Signup || false
		};

		if (loginAddress) {
			tokenContent.loginAddress = loginAddress;
		}

		if (loginWallet) {
			tokenContent.loginWallet = loginWallet;
		}

		if (twoFactorAuth?.enabled && twoFactorAuth?.verified) {
			tokenContent = {
				...tokenContent,
				isTFAEnabled: true
			};
		}

		// valid for 1 day
		return jwt.sign(tokenContent, { key: ACCESS_TOKEN_PRIVATE_KEY, passphrase: ACCESS_TOKEN_PASSPHRASE }, { algorithm: 'RS256', expiresIn: `${ACCESS_TOKEN_LIFE_IN_SECONDS}s` });
	}

	static async GetRefreshToken({ userId, loginAddress, loginWallet }: { userId: number; loginAddress?: string; loginWallet?: EWallet }): Promise<string> {
		const tokenContent: IRefreshTokenPayload = {
			iat: Math.floor(Date.now() / 1000),
			id: userId,
			loginAddress,
			loginWallet
		};

		const refreshToken = jwt.sign(
			tokenContent,
			{ key: REFRESH_TOKEN_PRIVATE_KEY, passphrase: REFRESH_TOKEN_PASSPHRASE },
			{ algorithm: 'RS256', expiresIn: `${REFRESH_TOKEN_LIFE_IN_SECONDS}s` }
		);

		// save refresh token in redis
		await RedisService.SetRefreshToken(userId, refreshToken);

		return refreshToken;
	}

	static async DeleteRefreshToken(refreshToken: string) {
		const refreshTokenPayload = this.GetRefreshTokenPayload(refreshToken);
		await RedisService.DeleteRefreshToken(refreshTokenPayload.id);
	}

	static async Web2Login(emailOrUsername: string, password: string): Promise<IAuthResponse> {
		const isEmail = ValidatorService.isValidEmail(emailOrUsername);

		// check if username is in blacklisted usernames
		if (!isEmail && ValidatorService.isValidUsername(emailOrUsername)) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Username is not allowed.');
		}

		// fetch user from db
		const user = isEmail ? await OffChainDbService.GetUserByEmail(emailOrUsername) : await OffChainDbService.GetUserByUsername(emailOrUsername);

		if (!user) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, `User not found: ${emailOrUsername}`);
		}

		const isCorrectPassword = await argon2.verify(user.password, password);

		if (!isCorrectPassword) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Incorrect password');
		}

		const isTFAEnabled = user.twoFactorAuth?.enabled || false;

		if (isTFAEnabled) {
			const tfaToken = createCuid();
			await RedisService.SetTfaToken(tfaToken, user.id);

			return {
				isTFAEnabled,
				tfaToken
			};
		}

		return {
			isTFAEnabled,
			refreshToken: await this.GetRefreshToken({ userId: user.id }),
			accessToken: await this.GetSignedAccessToken(user)
		};
	}

	static async Web2SignUp(email: string, password: string, username: string, network: ENetwork): Promise<IAuthResponse> {
		// find if username is in blacklisted usernames
		if (!ValidatorService.isValidUsername(username)) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Username is not allowed.');
		}

		// find if email is already in use
		if (await OffChainDbService.IsEmailInUse(email)) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Email is already in use.');
		}

		// find if username is already in use
		if (await OffChainDbService.IsUsernameInUse(username)) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Username is already in use.');
		}

		const user = await this.CreateUser({
			email,
			newPassword: password,
			username,
			isWeb3Signup: false,
			network,
			isCustomUsername: true
		});

		await this.CreateAndSendEmailVerificationToken(user);

		return {
			refreshToken: await this.GetRefreshToken({ userId: user.id }),
			accessToken: await this.GetSignedAccessToken(user)
		};
	}

	static async GetRefreshTokenCookie(refreshToken: string) {
		return serialize(ECookieNames.REFRESH_TOKEN, refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
	}

	static async GetAccessTokenCookie(accessToken: string) {
		return serialize(ECookieNames.ACCESS_TOKEN, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
	}

	static async Web3LoginOrRegister({ address, wallet, signature, network }: { address: string; wallet: EWallet; signature: string; network: ENetwork }): Promise<IAuthResponse> {
		if (!ValidatorService.isValidNetwork(network)) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid network');
		}

		if (!ValidatorService.isValidWallet(wallet)) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid wallet');
		}

		const isEvmAddress = ValidatorService.isValidEVMAddress(address);

		if (!isEvmAddress && !ValidatorService.isValidSubstrateAddress(address)) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid address');
		}

		// verify signature
		const isValidSignature = isEvmAddress ? ValidatorService.isValidEVMSignature(address, signature) : ValidatorService.isValidSubstrateSignature(address, signature);

		if (!isValidSignature) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Invalid signature');
		}

		const formattedAddress = isEvmAddress ? address : getSubstrateAddress(address)!;

		// find if user exists
		const user = await OffChainDbService.GetUserByAddress(formattedAddress);

		// if user exists, login
		if (user) {
			const isTFAEnabled = user.twoFactorAuth?.enabled || false;

			if (isTFAEnabled) {
				const tfaToken = createCuid();
				await RedisService.SetTfaToken(tfaToken, user.id);

				return {
					isTFAEnabled,
					tfaToken
				};
			}

			return {
				isTFAEnabled,
				refreshToken: await this.GetRefreshToken({ userId: user.id, loginAddress: formattedAddress, loginWallet: wallet }),
				accessToken: await this.GetSignedAccessToken({
					...user,
					loginAddress: formattedAddress,
					loginWallet: wallet
				})
			};
		}

		// user does not exist, register
		const username = `${formattedAddress.substring(0, 6)}...${formattedAddress.substring(formattedAddress.length - 4)}`; // example: 5Grwva...KpZf3 or 0x0000...0001
		const password = createCuid();

		const newUser = await this.CreateUser({
			email: '',
			newPassword: password,
			username,
			isWeb3Signup: true,
			network,
			isCustomUsername: false,
			address: formattedAddress,
			wallet
		});

		return {
			accessToken: await this.GetSignedAccessToken(newUser),
			refreshToken: await this.GetRefreshToken({ userId: newUser.id })
		};
	}

	static async IsValidRefreshToken(token: string) {
		try {
			if (!token.trim()) {
				return false;
			}

			const refreshTokenPayload = this.GetRefreshTokenPayload(token);

			if (!ValidatorService.isValidUserId(refreshTokenPayload.id) || !refreshTokenPayload.iat || !refreshTokenPayload.exp) {
				return false;
			}

			const redisRefreshToken = await RedisService.GetRefreshToken(refreshTokenPayload.id);

			return redisRefreshToken === token;
		} catch {
			return false;
		}
	}

	static IsValidAccessToken(token: string) {
		try {
			jwt.verify(token, ACCESS_TOKEN_PUBLIC_KEY);
			return true;
		} catch {
			return false;
		}
	}

	static GetRefreshTokenPayload(token: string) {
		try {
			return jwt.verify(token, REFRESH_TOKEN_PUBLIC_KEY) as IRefreshTokenPayload;
		} catch {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
		}
	}

	static GetAccessTokenPayload(token: string) {
		try {
			return jwt.verify(token, ACCESS_TOKEN_PUBLIC_KEY) as IAccessTokenPayload;
		} catch {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Invalid access token');
		}
	}

	private static async UpdateUserTfaDetails(userId: number, newTfaDetails: IUserTFADetails) {
		if (!ValidatorService.isValidUserId(userId)) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid user id');
		}

		await OffChainDbService.UpdateUserTfaDetails(userId, newTfaDetails);
	}

	static async GenerateTfaOtp(userId: number) {
		const base32Secret = generateRandomBase32();

		const totp = new TOTP({
			algorithm: 'SHA1',
			digits: 6,
			issuer: 'Polkassembly',
			label: `${userId}`,
			period: 30,
			secret: base32Secret
		});

		const otpauthUrl = totp.toString();

		const newTfaDetails: IUserTFADetails = {
			base32Secret,
			enabled: false,
			url: otpauthUrl,
			verified: false
		};

		await OffChainDbService.UpdateUserTfaDetails(userId, newTfaDetails);

		return { base32Secret, otpauthUrl };
	}

	static async IsValidTfaAuthCode({ userId, authCode, base32Secret }: { userId: number; authCode: string; base32Secret: string }) {
		if (!ValidatorService.isValidUserId(userId) || !authCode || !base32Secret) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid parameters for TFA auth code');
		}

		const totp = new TOTP({
			algorithm: 'SHA1',
			digits: 6,
			issuer: 'Polkassembly',
			label: `${userId}`,
			period: 30,
			secret: base32Secret
		});

		return totp.validate({ token: String(authCode).replaceAll(/\s/g, '') }) !== null;
	}

	static async VerifyTfa(userId: number, oldTfaDetails: IUserTFADetails) {
		if (!ValidatorService.isValidUserId(userId) || !oldTfaDetails?.base32Secret || !oldTfaDetails?.url) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid user id or TFA details');
		}

		const newTfaDetails: IUserTFADetails = {
			...oldTfaDetails,
			verified: true,
			enabled: true
		};

		await this.UpdateUserTfaDetails(userId, newTfaDetails);
	}

	static async GetUserFromTfaToken(tfaToken: string): Promise<IUser> {
		if (!tfaToken) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid TFA token');
		}

		const userId = await RedisService.GetTfaToken(tfaToken);

		if (!userId || !ValidatorService.isValidUserId(Number(userId))) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Invalid TFA token');
		}

		const user = await OffChainDbService.GetUserById(Number(userId));

		if (!user) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'User not found');
		}

		return user;
	}

	static async DisableTfa(userId: number) {
		if (!ValidatorService.isValidUserId(userId)) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid user id');
		}

		const newTfaDetails: IUserTFADetails = {
			enabled: false,
			verified: false,
			url: '',
			base32Secret: ''
		};

		await OffChainDbService.UpdateUserTfaDetails(userId, newTfaDetails);
	}

	/**
	 * Validate and refresh tokens, if access token is invalid, generates a new one using refresh token and rotates the refresh token
	 *
	 * @static
	 * @param {string} accessToken
	 * @param {string} refreshToken
	 * @return {*}  {Promise<{ newAccessTokenCookie: string; newRefreshTokenCookie: string }>}
	 * @memberof AuthService
	 * @throws {APIError} 401 - Invalid access token or refresh token
	 */
	static async ValidateAuthAndRefreshTokens(): Promise<{ newAccessToken: string; newRefreshToken: string }> {
		const cookiesStore = await cookies();
		const accessToken = cookiesStore.get(ECookieNames.ACCESS_TOKEN)?.value;
		const refreshToken = cookiesStore.get(ECookieNames.REFRESH_TOKEN)?.value;

		if (!refreshToken) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'User not logged in');
		}

		const isValidRefreshToken = await this.IsValidRefreshToken(refreshToken);

		if (!isValidRefreshToken) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
		}

		const isValidAccessToken = accessToken && this.IsValidAccessToken(accessToken);

		if (isValidAccessToken) {
			return {
				newAccessToken: accessToken,
				newRefreshToken: refreshToken
			};
		}

		// If access token is invalid, try to generate a new one using refresh token
		const refreshTokenPayload = this.GetRefreshTokenPayload(refreshToken);
		const user = await OffChainDbService.GetUserById(refreshTokenPayload.id);

		if (!user) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'User not found');
		}

		const newAccessToken = await this.GetSignedAccessToken({
			...user,
			loginAddress: refreshTokenPayload.loginAddress,
			loginWallet: refreshTokenPayload.loginWallet
		});

		// rotate refresh token
		const newRefreshToken = await this.GetRefreshToken({
			userId: user.id,
			loginAddress: refreshTokenPayload.loginAddress,
			loginWallet: refreshTokenPayload.loginWallet
		});

		return {
			newAccessToken,
			newRefreshToken
		};
	}
}
