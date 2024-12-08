// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENetwork, EWallet, IAuthResponse } from '@/_shared/types';
import React, { useState } from 'react';
import { InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { APPNAME } from '@/_shared/_constants/appName';
import { WEB3_AUTH_SIGN_MESSAGE } from '@/_shared/_constants/signMessage';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { stringToHex } from '@polkadot/util';
import { request } from '@/app/_client-utils/request';
import { Button } from '@/app/_shared-components/Button';
import { useRouter } from 'next/navigation';
import WalletButtons from '@ui/WalletsUI/WalletButtons/WalletButtons';
import { userAtom } from '@/app/_atoms/user/userAtom';
import { useSetAtom } from 'jotai';
import { AuthClientService } from '@/app/_client-services/auth_service';
import classes from './Web3Login.module.scss';
import SwitchToWeb2Signup from '../SwitchToWeb2Signup/SwitchToWeb2Signup';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const initAuthResponse: IAuthResponse = {
	isTFAEnabled: false,
	tfaToken: '',
	accessToken: '',
	userId: 0
};

function Web3Login({
	switchToWeb2,
	switchToSignup,
	onWalletChange,
	accounts,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
	setAccounts,
	address,
	onAccountChange,
	selectedWallet
}: {
	address: string;
	selectedWallet: EWallet | null;
	switchToWeb2: () => void;
	switchToSignup: () => void;
	accounts: InjectedAccount[];
	setAccounts: React.Dispatch<React.SetStateAction<InjectedAccount[]>>;
	onAccountChange: (a: string) => void;
	onWalletChange: (wallet: EWallet) => void;
}) {
	const router = useRouter();

	const setUserAtom = useSetAtom(userAtom);

	const [loading, setLoading] = useState(false);
	// const [authResponse, setAuthResponse] = useState<IAuthResponse>(initAuthResponse);

	const handleLogin = async () => {
		try {
			if (!selectedWallet) return;
			const injectedWindow = window as Window & InjectedWindow;
			const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[selectedWallet] : null;

			if (!wallet) {
				return;
			}

			const injected = wallet && wallet.enable && (await wallet.enable(APPNAME));

			const signRaw = injected && injected.signer && injected.signer.signRaw;
			if (!signRaw) {
				console.error('Signer not available');
				return;
			}

			setLoading(true);

			let substrateAddress;
			if (!address.startsWith('0x')) {
				substrateAddress = getSubstrateAddress(address);
				if (!substrateAddress) {
					console.error('Invalid address');
					setLoading(false);
					return;
				}
			} else {
				substrateAddress = address;
			}

			const signMessage = WEB3_AUTH_SIGN_MESSAGE;

			if (!signMessage) {
				setLoading(false);
				throw new Error('Challenge message not found');
			}

			const { signature } = await signRaw({
				address: substrateAddress,
				data: stringToHex(signMessage),
				type: 'bytes'
			});

			const data = await request<IAuthResponse>(
				'/auth/actions/web3LoginOrSignup',
				{
					'x-network': ENetwork.POLKADOT
				},
				{
					body: JSON.stringify({
						address: substrateAddress,
						signature,
						wallet: selectedWallet
					}),
					method: 'POST'
				}
			);

			if (data && data.accessToken) {
				console.log('login data', data);
				const decodedData = AuthClientService.handleTokenChange(data.accessToken);

				if (decodedData) {
					setUserAtom({
						address: decodedData.defaultAddress,
						userId: String(decodedData.id),
						username: decodedData.username,
						wallet: decodedData.loginWallet
					});
				}
				router.back();
			}
			setLoading(false);
		} catch (error) {
			// setError(error.message);
			console.log('error', error);
			setLoading(false);
		}
	};

	return (
		<div className='w-full'>
			<WalletButtons
				accounts={accounts}
				selectedAddress={address}
				onAddressChange={onAccountChange}
				onWalletChange={onWalletChange}
				selectedWallet={selectedWallet || undefined}
			/>
			<div>
				{address && (
					<div className={classes.footer}>
						{/* <Button
						variant='secondary'
						disabled={loading}
						onClick={() => {
							setAccounts([]);
							onAccountChange('');
						}}
					>
						Go Back
					</Button> */}
						<Button
							isLoading={loading}
							onClick={handleLogin}
							size='lg'
							className={classes.loginButton}
						>
							Login
						</Button>
					</div>
				)}
				<div className={classes.switchToWeb2}>
					Or
					<Button
						variant='ghost'
						className='px-0 text-text_pink'
						onClick={switchToWeb2}
					>
						Login with Username
					</Button>
				</div>
				{address && (
					<SwitchToWeb2Signup
						switchToSignup={() => {
							switchToWeb2();
							switchToSignup();
						}}
					/>
				)}
			</div>
		</div>
	);
}

export default Web3Login;
