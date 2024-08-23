// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { IAuthToken, IUser, IUserAddress, JWTPayloadType, Role, Wallet } from '@shared/types';
import { cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto';
import { APIError } from '@app/api/_api-utils/apiError';
import { ACCESS_TOKEN_LIFE_IN_SECONDS } from '@app/api/_api-constants/jwt';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { JWT_KEY_PASSPHRASE, JWT_PRIVATE_KEY, JWT_PUBLIC_KEY } from '@api/_api-constants/apiEnvVars';
import getSubstrateAddress from '@shared/_utils/getSubstrateAddress';
import { SIGN_MESSAGE } from '@shared/_constants/signMessage';

export class AuthService {
	/**
	 *
	 *
	 * @static
	 * @param {string} token
	 * @return {*}  {Promise<string>}
	 * @memberof AuthService
	 * @description Get user id from JWT if the jwt is valid
	 * @throws {APIError} If the token is not found in the auth header or the user is not found
	 */
	static async GetUserIdFromJWT(token: string): Promise<string> {
		if (!JWT_PUBLIC_KEY) {
			console.log('JWT_PUBLIC_KEY env variable not set');
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR);
		}

		let decoded: JWTPayloadType;

		try {
			decoded = jwt.verify(token, JWT_PUBLIC_KEY) as JWTPayloadType;
		} catch (e) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, `${(e as Error).message}`);
		}

		if (!decoded.id) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
		}

		return decoded.id;
	}

	/**
	 *
	 *
	 * @static
	 * @param {string} authHeader
	 * @return {*}  {Promise<IUser>}
	 * @memberof AuthService
	 * @description Get user object from JWT in the auth header, if the jwt is valid
	 * @throws {APIError} If the token is not found in the auth header or the user is not found
	 */
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

	/**
	 *
	 *
	 * @static
	 * @param {string} token
	 * @return {*}  {(Promise<IUser | null>)}
	 * @memberof AuthService
	 * @description Get user object from JWT if the jwt is valid
	 */
	static async GetUserWithJWT(token: string): Promise<IUser | null> {
		const userId = await this.GetUserIdFromJWT(token);

		// TODO: fetch from firestore
		const user = {};

		if (!user) {
			console.log('User not found: ', userId);
			return null;
		}

		return {} as IUser;
	}

	/**
	 *
	 *
	 * @static
	 * @param {IUser} user
	 * @return {*}  {Promise<string>}
	 * @memberof AuthService
	 * @description Get signed token from a user object
	 * @throws {APIError} If the JWT_PRIVATE_KEY or JWT_KEY_PASSPHRASE env variable is not set
	 */
	static async GetSignedJWT(user: IUser): Promise<string> {
		if (!JWT_PRIVATE_KEY || !JWT_KEY_PASSPHRASE) {
			console.log('JWT_PRIVATE_KEY or JWT_KEY_PASSPHRASE env variable not set', {
				JWT_KEY_PASSPHRASE,
				JWT_PRIVATE_KEY
			});

			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR);
		}

		const tokenContent: JWTPayloadType = {
			...user,
			iat: Math.floor(Date.now() / 1000)
		};

		return jwt.sign(tokenContent, { key: JWT_PRIVATE_KEY, passphrase: JWT_KEY_PASSPHRASE }, { algorithm: 'RS256', expiresIn: `${ACCESS_TOKEN_LIFE_IN_SECONDS}s` });
	}

	/**
	 *
	 *
	 * @static
	 * @param {string} address
	 * @param {Wallet} wallet
	 * @param {string} signature
	 * @return {*}  {Promise<IAuthToken>}
	 * @memberof AuthService
	 * @description Connect wallet: verifies the signature and returns a signed JWT
	 * @throws {APIError} If the address is invalid or the signature is invalid
	 */
	static async Web3LoginOrRegister(address: string, wallet: Wallet, signature: string): Promise<IAuthToken> {
		const substrateAddress = getSubstrateAddress(address) || address;

		if (!substrateAddress) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST);
		}

		await cryptoWaitReady();
		const { isValid } = verifySignature(substrateAddress, signature);

		if (!isValid) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
		}

		let userId = '';
		let userAddresses: IUserAddress[] = [];

		const userAddress = await prisma.userAddress.findFirst({
			where: {
				address: substrateAddress
			},
			include: {
				user: {
					include: {
						addresses: true
					}
				}
			}
		});

		userId = userAddress?.userId || '';
		userAddresses =
			userAddress?.user.addresses.map((addressObj) => {
				return {
					address: addressObj.address,
					wallet: addressObj.wallet,
					userId: addressObj.userId,
					createdAt: addressObj.createdAt,
					updatedAt: addressObj.updatedAt
				} as IUserAddress;
			}) || [];

		if (!userAddress) {
			const newUser = await prisma.userAddress.create({
				data: {
					address: substrateAddress,
					wallet,
					user: {
						create: {
							roles: [Role.USER]
						}
					}
				}
			});
			userId = newUser.userId;
			userAddresses = [
				{
					address: newUser.address,
					wallet: newUser.wallet,
					userId: newUser.userId,
					createdAt: newUser.createdAt,
					updatedAt: newUser.updatedAt
				} as IUserAddress
			];
		}

		// update wallet if it is saved as OTHER
		const currentAddressObj = userAddresses.find((addressObj) => addressObj.address === address);
		if (currentAddressObj?.wallet === Wallet.OTHER) {
			await prisma.userAddress.update({
				where: {
					address
				},
				data: {
					wallet
				}
			});

			// update wallet in userAddresses array
			userAddresses = userAddresses.map((addressObj) => {
				if (addressObj.address === address) {
					return {
						address: addressObj.address,
						wallet,
						userId: addressObj.userId,
						createdAt: addressObj.createdAt,
						updatedAt: addressObj.updatedAt
					} as IUserAddress;
				}
				return addressObj;
			});
		}

		return {
			token: await this.GetSignedJWT({
				addresses: userAddresses,
				id: userId,
				roles: [Role.USER],
				createdAt: new Date(),
				updatedAt: new Date()
			} as IUser)
		};
	}

	/**
	 *
	 *
	 * @static
	 * @param {string} id
	 * @param {string} address
	 * @param {Wallet} wallet
	 * @param {string} signature
	 * @return {*}  {Promise<IAuthToken>}
	 * @memberof AuthService
	 */
	static async LinkAddress(id: string, address: string, wallet: Wallet, signature: string): Promise<IAuthToken> {
		const substrateAddress = getSubstrateAddress(address) || address;

		// eslint-disable-next-line sonarjs/no-small-switch
		switch (wallet) {
			case Wallet.METAMASK || Wallet.SOLANA: {
				await cryptoWaitReady();
				const { isValid } = verifySignature(substrateAddress, signature);

				if (!isValid) {
					throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
				}

				// Check if the address already exists for this user
				const existingAddress = await prisma.userAddress.findUnique({
					where: { address }
				});

				if (existingAddress) {
					throw new APIError(ERROR_CODES.ALREADY_PROCESSED, StatusCodes.CONFLICT);
				}

				// Create a new UserAddress
				const newUserAddress = await prisma.userAddress.create({
					data: {
						address,
						wallet,
						userId: id
					}
				});

				// Update the user's addresses array
				const user = await prisma.user.update({
					where: { id },
					data: {
						addresses: {
							connect: { id: newUserAddress.id }
						}
					},
					include: {
						addresses: true
					}
				});

				return {
					token: await this.GetSignedJWT({
						addresses: user.addresses.map((addressObj) => {
							return {
								address: addressObj.address,
								wallet: addressObj.wallet,
								userId: addressObj.userId,
								createdAt: addressObj.createdAt,
								updatedAt: addressObj.updatedAt
							} as IUserAddress;
						}),
						id: user.id,
						roles: [Role.USER],
						createdAt: new Date(),
						updatedAt: new Date()
					} as IUser)
				};
			}

			default: {
				const substrateAddress = getSubstrateAddress(address);

				if (!substrateAddress) {
					console.log('Invalid address: ', address);
					throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST);
				}

				await cryptoWaitReady();
				const { isValid } = signatureVerify(SIGN_MESSAGE, signature, substrateAddress);

				if (!isValid) {
					console.log('Invalid signature for address: ', address);
					throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
				}

				// Check if the address already exists for this user
				const existingAddress = await prisma.userAddress.findUnique({
					where: { address }
				});

				if (existingAddress) {
					throw new APIError(ERROR_CODES.ALREADY_PROCESSED, StatusCodes.CONFLICT);
				}

				// Create a new UserAddress
				const newUserAddress = await prisma.userAddress.create({
					data: {
						address,
						wallet,
						userId: id
					}
				});

				// Update the user's addresses array
				const user = await prisma.user.update({
					where: { id },
					data: {
						addresses: {
							connect: { id: newUserAddress.id }
						}
					},
					include: {
						addresses: true
					}
				});

				return {
					token: await this.GetSignedJWT({
						addresses: user.addresses.map((addressObj) => {
							return {
								address: addressObj.address,
								wallet: addressObj.wallet,
								userId: addressObj.userId,
								createdAt: addressObj.createdAt,
								updatedAt: addressObj.updatedAt
							} as IUserAddress;
						}),
						id: user.id,
						roles: [Role.USER],
						createdAt: new Date(),
						updatedAt: new Date()
					} as IUser)
				};
			}
		}
	}

	/**
	 *
	 *
	 * @static
	 * @param {string} id
	 * @param {string} address
	 * @param {Wallet} wallet
	 * @param {string} signature
	 * @return {*}  {Promise<IAuthToken>}
	 * @memberof AuthService
	 */
	static async RemoveAddress(userId: string, address: string, signature: string): Promise<IAuthToken> {
		const substrateAddress = getSubstrateAddress(address);

		if (!substrateAddress) {
			console.log('Invalid address: ', address);
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST);
		}

		await cryptoWaitReady();
		const { isValid } = verifySignature(substrateAddress, signature);

		if (!isValid) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
		}

		// Check if the address exists and belongs to the user
		const existingAddress = await prisma.userAddress.findUnique({
			where: { address }
		});

		if (!existingAddress || existingAddress.userId !== userId) {
			throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND);
		}

		// Delete the address
		await prisma.userAddress.delete({
			where: { id: existingAddress.id }
		});

		// Update the user's addresses array (this happens automatically due to the relation)
		const user = await prisma.user.update({
			where: { id: userId },
			data: {
				addresses: {
					disconnect: { id: existingAddress.id }
				}
			},
			include: {
				addresses: true
			}
		});

		return {
			token: await this.GetSignedJWT({
				addresses: user.addresses.map((addressObj) => {
					return {
						address: addressObj.address,
						wallet: addressObj.wallet,
						userId: addressObj.userId,
						createdAt: addressObj.createdAt,
						updatedAt: addressObj.updatedAt
					} as IUserAddress;
				}),
				id: user.id,
				roles: [Role.USER],
				createdAt: new Date(),
				updatedAt: new Date()
			} as IUser)
		};
	}
}
