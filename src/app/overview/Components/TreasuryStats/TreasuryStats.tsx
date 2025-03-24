import { useTranslations } from 'next-intl';
import { MdInfoOutline } from 'react-icons/md';

export default function TreasuryStats() {
	const t = useTranslations('Overview');
	return (
		<div className='rounded-lg border-none bg-bg_modal p-4 shadow-lg'>
			<div className='p-3'>
				<p className='text-sm text-wallet_btn_text'>
					{t('treasury')} <MdInfoOutline className='inline-block text-lg' />
				</p>
				<div className='mt-4 flex items-center justify-center'>
					<p className='text-sm text-btn_secondary_text'>{t('comingSoon')}</p>
				</div>
			</div>
		</div>
	);
}
