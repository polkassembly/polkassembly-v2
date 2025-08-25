// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ValidatorService } from '@/_shared/_services/validator_service';
import { useTranslations } from 'next-intl';
import { CircleDollarSignIcon, Info } from 'lucide-react';
import Tip1 from '@assets/tipping/tip-1.svg';
import Tip2 from '@assets/tipping/tip-2.svg';
import Tip3 from '@assets/tipping/tip-3.svg';
import Tip4 from '@assets/tipping/tip-4.svg';
import Image, { StaticImageData } from 'next/image';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import dayjs from 'dayjs';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { BN, BN_ZERO } from '@polkadot/util';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { decimalToBN } from '@/_shared/_utils/decimalToBN';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { ENotificationStatus, ISelectedAccount } from '@/_shared/types';
import SaySomethingIcon from '@assets/tipping/say-something.svg';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { useUser } from '@/hooks/useUser';
import { useTipModal } from '@/hooks/useTipModal';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../Dialog/Dialog';
import SwitchWalletOrAddress from '../SwitchWalletOrAddress/SwitchWalletOrAddress';
import BalanceInput from '../BalanceInput/BalanceInput';
import AddressRelationsPicker from '../AddressRelationsPicker/AddressRelationsPicker';
import { Input } from '../Input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';
import classes from './CreateTipModal.module.scss';

interface IDefaultTip {
	image: StaticImageData;
	title: string;
	value: number;
	nativeTokenAmount?: BN;
}

const DEFAULT_TIPS: IDefaultTip[] = [
	{ image: Tip1, title: '$3', value: 3 },
	{ image: Tip2, title: '$5', value: 5 },
	{ image: Tip3, title: '$10', value: 10 },
	{ image: Tip4, title: '$15', value: 15 }
];

const DEFAULT_REMARK = 'Tipped via Polkassembly';

function CreateTipModal() {
	const t = useTranslations('Profile');
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();
	const { apiService } = usePolkadotApiService();
	const { beneficiaryAddress, open: openModal, setOpenTipModal: setOpenModal, setBeneficiaryAddress } = useTipModal();
	const { toast } = useToast();
	const network = getCurrentNetwork();
	const [tipAmount, setTipAmount] = useState<BN>(BN_ZERO);
	const [remark, setRemark] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);

	const handleOpenChange = (open: boolean) => {
		setOpenModal(open);
		if (!open) {
			setBeneficiaryAddress('');
		}
	};

	const getExistentialDeposit = async () => {
		if (!apiService) return undefined;
		const deposit = await apiService.getExistentialDeposit();
		return new BN(deposit.toString());
	};

	const { data: existentialDeposit } = useQuery({
		queryKey: ['existentialDeposit'],
		enabled: !!apiService,
		queryFn: getExistentialDeposit,
		staleTime: FIVE_MIN_IN_MILLI
	});

	const getCurrentNavtiveTokenPrice = async () => {
		const { data } = await NextApiClientService.getTreasuryStats({
			from: dayjs().subtract(1, 'hour').toDate(),
			to: dayjs().toDate()
		});
		return data?.[0]?.nativeTokenUsdPrice;
	};

	const { data: nativeTokenUsdPrice } = useQuery({
		queryKey: ['nativeTokenPrice'],
		queryFn: getCurrentNavtiveTokenPrice,
		staleTime: FIVE_MIN_IN_MILLI
	});

	const createTipInDb = async (txHash: string, updatedRemark: string) => {
		if (!user?.id || !beneficiaryAddress) return null;
		const { data, error } = await NextApiClientService.createTip({
			userId: user?.id,
			userAddress: userPreferences.selectedAccount?.address || '',
			amount: tipAmount.toString(),
			beneficiaryAddress,
			remark: updatedRemark,
			extrinsicHash: txHash
		});
		if (error) {
			throw new Error(error.message);
		}
		setTipAmount(BN_ZERO);
		setRemark('');
		setBeneficiaryAddress('');
		return data;
	};

	const onTip = async () => {
		if (!apiService || !userPreferences.selectedAccount?.address || !user?.id || !beneficiaryAddress || !ValidatorService.isValidWeb3Address(beneficiaryAddress)) return;

		setIsLoading(true);

		const updatedRemark = remark?.length > 0 ? `${remark || ''}${remark[remark.length - 1] !== '.' ? '.' : ''} ${DEFAULT_REMARK}`.trim().trim() : DEFAULT_REMARK;

		const getRegularAddress = (selectedAccount: ISelectedAccount): string => {
			if (selectedAccount.parent) {
				return getRegularAddress(selectedAccount.parent);
			}
			return selectedAccount.address;
		};
		await apiService.transferKeepAlive({
			selectedAccount: userPreferences.selectedAccount,
			address: getRegularAddress(userPreferences.selectedAccount),
			beneficiaryAddress,
			amount: tipAmount,
			remark: updatedRemark,
			onSuccess: async (txHash?: string) => {
				toast({
					title: t('Tips.tipSuccess'),
					description: t('Tips.tipSuccessDescription'),
					status: ENotificationStatus.SUCCESS
				});
				if (txHash) {
					createTipInDb(txHash, updatedRemark);
				}
				setOpenModal(false);
				setIsLoading(false);
			},
			onFailed: (error: string) => {
				toast({
					title: t('Tips.tipFailed'),
					description: error || t('Tips.tipFailedDescription'),
					status: ENotificationStatus.ERROR
				});
				setIsLoading(false);
			}
		});
	};

	const TipsWithNativeTokenAmount = useMemo(() => {
		if (!nativeTokenUsdPrice || !network) return DEFAULT_TIPS;
		const { tokenDecimals } = NETWORKS_DETAILS[`${network}`];

		const currentTokenPrice = nativeTokenUsdPrice ? decimalToBN(nativeTokenUsdPrice) : null;

		return DEFAULT_TIPS.map((tip) => ({
			...tip,
			nativeTokenAmount: currentTokenPrice
				? new BN(tip.value)
						.mul(new BN(10).pow(new BN(tokenDecimals)))
						.mul(new BN(10).pow(new BN(currentTokenPrice?.decimals || BN_ZERO.toString())))
						.div(new BN(currentTokenPrice?.value))
				: BN_ZERO
		}));
	}, [nativeTokenUsdPrice, network]);

	return (
		<Dialog
			open={openModal}
			onOpenChange={handleOpenChange}
		>
			<DialogContent className='w-[600px] p-6 max-sm:w-full'>
				<DialogHeader>
					<DialogTitle className={classes.title}>
						<CircleDollarSignIcon className='size-6' />
						{t('Tips.giveATip')}
					</DialogTitle>
				</DialogHeader>
				<div className={classes.content}>
					<SwitchWalletOrAddress
						disabled={isLoading}
						small
						customAddressSelector={<AddressRelationsPicker withBalance />}
					/>
					<div className={classes.tipsContainer}>
						<span className={classes.tipsContainerTitle}>{t('Tips.pleaseSelectATip')}:</span>
						<div className='flex justify-between gap-4'>
							{TipsWithNativeTokenAmount.map((tip) => (
								<Button
									key={tip.value}
									disabled={isLoading}
									className={cn(
										tipAmount.eq(tip.nativeTokenAmount || BN_ZERO) ? 'bg-selected_tip_bg' : '',
										'flex h-[36px] w-[102px] items-center gap-1 rounded-3xl border-[1px] border-solid border-text_pink'
									)}
									variant='ghost'
									onClick={() => setTipAmount(tip.nativeTokenAmount || BN_ZERO)}
								>
									<Image
										src={tip.image}
										alt={tip.title}
										width={32}
										height={32}
									/>
									<span className={classes.tipButtonText}>{tip.title}</span>
								</Button>
							))}
						</div>
					</div>
					<BalanceInput
						value={tipAmount}
						disabled={isLoading}
						label={t('Tips.orEnterTheCustomAmountYouWouldLikeToTip')}
						onChange={({ value }) => setTipAmount(value)}
						className='h-10 rounded-md bg-bg_modal'
					/>

					<div className='relative'>
						{/* Speech bubble container with image background */}
						<div className='relative'>
							<Image
								src={SaySomethingIcon}
								alt='say something'
								className={classes.saySomethingIcon}
							/>
							{/* Input component positioned over the image with proper margins */}
							<div className='relative z-10 px-6 py-6'>
								<Input
									value={remark || ''}
									onChange={(e) => setRemark(e.target.value)}
									className={cn(classes.remarkInput, 'placeholder:text-text_secondary')}
									placeholder={t('Tips.saySomething')}
								/>
							</div>
						</div>
					</div>

					{/* Existential Deposit */}
					{!!existentialDeposit && existentialDeposit.gt(BN_ZERO) && (
						<div className={classes.existentialDepositContainer}>
							<div className={classes.existentialDepositTitle}>
								<span>{t('Tips.existentialDeposit')}</span>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger>
											<Info className='text-text-grey h-4 w-4' />
										</TooltipTrigger>
										<TooltipContent className='bg-tooltip_background p-2 text-white'>
											<p>{t('Tips.existentialDepositTooltip')}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							<span className={classes.existentialDepositAmount}>
								{formatBnBalance(existentialDeposit, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
							</span>
						</div>
					)}

					<div className={classes.tipFooter}>
						<Button
							variant='default'
							className='mt-4 w-28'
							onClick={onTip}
							disabled={isLoading}
							isLoading={isLoading}
						>
							{t('Tips.tip')}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default CreateTipModal;
