// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { APIError } from '@app/api/_api-utils/apiError';
import { ACCESS_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_COOKIE_OPTIONS } from '@app/api/_api-constants/jwt';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { JWT_KEY_PASSPHRASE, JWT_PRIVATE_KEY, JWT_PUBLIC_KEY, REFRESH_TOKEN_PASSPHRASE, REFRESH_TOKEN_PRIVATE_KEY } from '@api/_api-constants/apiEnvVars';
import { serialize } from 'cookie';
import * as argon2 from 'argon2';
import { createId as createCuid } from '@paralleldrive/cuid2';
import { ENetwork, ERole, EWallet, IHashedPassword, IAuthResponse, IRefreshTokenPayload, IUser, IAccessTokenPayload, EAuthCookieNames } from '@shared/types';
import { ValidatorService } from '@shared/_services/validator_service';
import { randomBytes } from 'crypto';
import { DEFAULT_PROFILE_DETAILS } from '@shared/_constants/defaultProfileDetails';
import { OffChainDbService } from '../offchain_db_service';
import { redisSetex } from '../redis_service';
import { get2FAKey, getEmailVerificationTokenKey } from '../redis_service/redisKeys';
import { ACCESS_TOKEN_LIFE_IN_SECONDS, FIVE_MIN, ONE_DAY, REFRESH_TOKEN_LIFE_IN_SECONDS } from '../../_api-constants/timeConstants';
import { NotificationService } from '../notification_service';

if (!JWT_PRIVATE_KEY || !JWT_PUBLIC_KEY || !JWT_KEY_PASSPHRASE) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'JWT_PRIVATE_KEY, JWT_PUBLIC_KEY or JWT_KEY_PASSPHRASE not set. Aborting.');
}

if (!REFRESH_TOKEN_PRIVATE_KEY || !REFRESH_TOKEN_PASSPHRASE) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'REFRESH_TOKEN_PRIVATE_KEY or REFRESH_TOKEN_PASSPHRASE not set. Aborting.');
}

export class AuthService {
	private static async CreateAndSendEmailVerificationToken(user: IUser): Promise<void> {
		if (user.email) {
			const verifyToken = createCuid();
			await redisSetex(getEmailVerificationTokenKey(verifyToken), ONE_DAY, user.email);

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
		isCustomUsername = false
	}: {
		email: string;
		newPassword: string;
		username: string;
		isWeb3Signup: boolean;
		network: ENetwork;
		isCustomUsername: boolean;
	}): Promise<IUser> {
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

		return newUser;
	}

	static async GetUserIdFromJWT(token: string): Promise<number> {
		let decoded: IAccessTokenPayload;

		try {
			decoded = jwt.verify(token, JWT_PUBLIC_KEY) as IAccessTokenPayload;
		} catch (e) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, `${(e as Error).message}`);
		}

		if (!decoded.id) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
		}

		return decoded.id;
	}

	static async GetUserFromAuthHeader(authHeader: string): Promise<IUser> {
		const token = authHeader.split(' ')[1];

		if (!token) {
			console.log('Token not found in auth header: ', authHeader);
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
		}

		const user = await this.GetUserWithJWT(token);

		if (!user) {
			console.log('User not found: ', token);
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
		}

		return user;
	}

	static async GetUserWithJWT(token: string): Promise<IUser | null> {
		const userId = await this.GetUserIdFromJWT(token);

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
				is2FAEnabled: true
			};
		}

		// valid for 1 day
		return jwt.sign(tokenContent, { key: JWT_PRIVATE_KEY, passphrase: JWT_KEY_PASSPHRASE }, { algorithm: 'RS256', expiresIn: `${ACCESS_TOKEN_LIFE_IN_SECONDS}s` });
	}

	static async GetRefreshToken({ userId, loginAddress, loginWallet }: { userId: number; loginAddress?: string; loginWallet?: EWallet }): Promise<string> {
		const tokenContent: IRefreshTokenPayload = {
			iat: Math.floor(Date.now() / 1000),
			id: userId,
			loginAddress,
			loginWallet
		};

		return jwt.sign(tokenContent, { key: REFRESH_TOKEN_PRIVATE_KEY, passphrase: REFRESH_TOKEN_PASSPHRASE }, { algorithm: 'RS256', expiresIn: `${REFRESH_TOKEN_LIFE_IN_SECONDS}s` });
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
			await redisSetex(get2FAKey(Number(user.id)), FIVE_MIN, tfaToken);

			return {
				isTFAEnabled,
				tfaToken,
				userId: user.id
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
		if (ValidatorService.isValidUsername(username)) {
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
			accessToken: await this.GetSignedAccessToken(user)
		};
	}

	static async GetRefreshTokenCookie(refreshToken: string) {
		return serialize(EAuthCookieNames.REFRESH_TOKEN, refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
	}

	static async GetAccessTokenCookie(accessToken: string) {
		return serialize(EAuthCookieNames.ACCESS_TOKEN, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
	}
}
