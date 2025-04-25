// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import Image from 'next/image';
import UserIcon from '@assets/profile/user-icon.svg';
import rankStar from '@assets/profile/rank-star.svg';
import { IPublicUser } from '@/_shared/types';
import { dayjs } from '@shared/_utils/dayjsInit';
import { cn } from '@/lib/utils';
import CalendarIcon from '@assets/icons/calendar-icon.svg';
import { IoPersonAdd } from '@react-icons/all-files/io5/IoPersonAdd';
import { AiFillDollarCircle } from '@react-icons/all-files/ai/AiFillDollarCircle';
import { TableRow, TableCell } from '@ui/Table';
import styles from './Leaderboard.module.scss';

interface TableRowProps {
	user: IPublicUser;
	isCurrentUser: boolean;
	isBottom?: boolean;
}

function LeadboardRow({ user, isCurrentUser, isBottom = false }: TableRowProps) {
	return (
		<TableRow
			key={`${user.id}${isBottom ? '-bottom' : ''}`}
			className={cn(isCurrentUser && styles.tableRow_user)}
		>
			<TableCell className={styles.tableCell_3}>{user.rank}</TableCell>
			<TableCell className={styles.tableCell_2}>
				<Link
					href={`/user/username/${user.username}`}
					className='flex items-center gap-x-2'
				>
					<Image
						src={UserIcon}
						alt='User Icon'
						className='h-6 w-6'
						width={20}
						height={20}
					/>
					<span className='text-sm font-medium'>{user.username}</span>
				</Link>
			</TableCell>
			<TableCell className='p-4'>
				<span className='flex w-20 items-center gap-1 rounded-lg bg-rank_card_bg px-1.5 py-0.5 font-medium'>
					<Image
						src={rankStar}
						alt='Rank Star'
						width={16}
						height={16}
					/>
					<span className='text-sm font-medium text-leaderboard_score'>{user.profileScore ?? 0}</span>
				</span>
			</TableCell>
			<TableCell className={styles.tableCell}>
				<span className='flex items-center gap-x-2 text-xs'>
					<Image
						src={CalendarIcon}
						alt='calendar'
						width={20}
						height={20}
					/>
					<span className='whitespace-nowrap'>{dayjs(user.createdAt ?? '').format("Do MMM 'YY")}</span>
				</span>
			</TableCell>
			<TableCell className={styles.tableContentCell_last}>
				{!isCurrentUser && (
					<div className='flex items-center gap-1'>
						<IoPersonAdd className='text-lg text-text_primary' />
						<AiFillDollarCircle className='text-2xl text-text_primary' />
					</div>
				)}
			</TableCell>
		</TableRow>
	);
}
export default LeadboardRow;
