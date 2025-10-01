// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import RootIcon from '@assets/sidebar/root-icon.svg';
import TreasurerIcon from '@assets/sidebar/treasurer-icon.svg';
import WishForChangeIcon from '@assets/sidebar/wish-for-change-icon.svg';
import ReferendumCancellorIcon from '@assets/sidebar/referendum-cancellor-icon.svg';
import ReferendumKillerIcon from '@assets/sidebar/referendum-killer-icon.svg';
import WhitelistedCallerIcon from '@assets/sidebar/whitelisted-caller-icon.svg';
import FellowshipAdminIcon from '@assets/sidebar/fellowship-admin-icon.svg';
import AdministrationIcon from '@assets/sidebar/admin-icon.svg';
import TreasuryIcon from '@assets/sidebar/treasury-icon.svg';
import DemocracyReferendaIcon from '@assets/sidebar/democracy-referenda-icon.svg';
import ProposalIcon from '@assets/sidebar/proposal-icon.svg';
import BountyIcon from '@assets/sidebar/bounty.svg';
import TipsIcon from '@assets/sidebar/tips-icon.svg';
import TechCommProposalsIcon from '@assets/sidebar/tech-comm-proposals-icon.svg';
import CouncilMotionIcon from '@assets/sidebar/council-motion-icon.svg';
import PolkadotLogo from '@assets/parachain-logos/polkadot-logo.jpg';
import KusamaLogo from '@assets/parachain-logos/kusama-logo.gif';
import MoonbeamLogo from '@assets/parachain-logos/moonbeam-logo.png';
import MoonriverLogo from '@assets/parachain-logos/moonriver-logo.png';
import CollectivesLogo from '@assets/parachain-logos/collectives-logo.png';
import PendulumLogo from '@assets/parachain-logos/pendulum-logo.jpg';
import CereLogo from '@assets/parachain-logos/cere-logo.jpg';
import PolkadexLogo from '@assets/parachain-logos/polkadex-logo.jpg';
import PolymeshLogo from '@assets/parachain-logos/polymesh-logo.png';
import MoonbaseLogo from '@assets/parachain-logos/moonbase-logo.png';
import WestendLogo from '@assets/parachain-logos/westend-logo.jpg';
import PaseoLogo from '@assets/parachain-logos/paseo-logo.png';
import { EPostOrigin, EProposalType } from '../types';

export const getOriginIcon = (origin: EPostOrigin) => {
	switch (origin) {
		case EPostOrigin.ROOT:
			return RootIcon;
		case EPostOrigin.TREASURER:
			return TreasurerIcon;
		case EPostOrigin.WISH_FOR_CHANGE:
			return WishForChangeIcon;
		case EPostOrigin.REFERENDUM_CANCELLER:
			return ReferendumCancellorIcon;
		case EPostOrigin.REFERENDUM_KILLER:
			return ReferendumKillerIcon;
		case EPostOrigin.WHITELISTED_CALLER:
			return WhitelistedCallerIcon;
		case EPostOrigin.FELLOWSHIP_ADMIN:
			return FellowshipAdminIcon;
		case EPostOrigin.STAKING_ADMIN:
		case EPostOrigin.AUCTION_ADMIN:
		case EPostOrigin.LEASE_ADMIN:
		case EPostOrigin.GENERAL_ADMIN:
			return AdministrationIcon;
		case EPostOrigin.SMALL_TIPPER:
		case EPostOrigin.BIG_TIPPER:
		case EPostOrigin.SMALL_SPENDER:
		case EPostOrigin.MEDIUM_SPENDER:
		case EPostOrigin.BIG_SPENDER:
			return TreasuryIcon;
		default:
			return AdministrationIcon;
	}
};

export const getGov1Icon = (itemKey: string) => {
	switch (itemKey) {
		case 'mentionsIReceive':
			return AdministrationIcon;
		case EProposalType.REFERENDUM:
			return DemocracyReferendaIcon;
		case EProposalType.DEMOCRACY_PROPOSAL:
			return ProposalIcon;
		case EProposalType.BOUNTY:
			return BountyIcon;
		case EProposalType.CHILD_BOUNTY:
			return BountyIcon;
		case EProposalType.TIP:
			return TipsIcon;
		case EProposalType.TECHNICAL_COMMITTEE:
			return TechCommProposalsIcon;
		case EProposalType.COUNCIL_MOTION:
			return CouncilMotionIcon;
		default:
			return AdministrationIcon;
	}
};

export const getGov1NotificationLabels = (itemKey: string, t: (key: string) => string): { [key: string]: string } | undefined => {
	switch (itemKey) {
		case EProposalType.REFERENDUM:
			return {
				newReferendumSubmitted: t('Profile.Settings.Notifications.newReferendumSubmitted'),
				referendumInVoting: t('Profile.Settings.Notifications.referendumInVoting'),
				referendumClosed: t('Profile.Settings.Notifications.referendumClosed')
			};
		case EProposalType.DEMOCRACY_PROPOSAL:
			return {
				newProposalsSubmitted: t('Profile.Settings.Notifications.newProposalsSubmitted'),
				proposalInVoting: t('Profile.Settings.Notifications.proposalInVoting'),
				proposalClosed: t('Profile.Settings.Notifications.proposalClosed')
			};
		case EProposalType.BOUNTY:
			return {
				bountiesSubmitted: t('Profile.Settings.Notifications.bountiesSubmitted'),
				bountiesClosed: t('Profile.Settings.Notifications.bountiesClosed')
			};
		case EProposalType.CHILD_BOUNTY:
			return {
				childBountiesSubmitted: t('Profile.Settings.Notifications.childBountiesSubmitted'),
				childBountiesClosed: t('Profile.Settings.Notifications.childBountiesClosed')
			};
		case EProposalType.TIP:
			return {
				newTipsSubmitted: t('Profile.Settings.Notifications.newTipsSubmitted'),
				tipsOpened: t('Profile.Settings.Notifications.tipsOpened'),
				tipsClosed: t('Profile.Settings.Notifications.tipsClosed')
			};
		case EProposalType.TECHNICAL_COMMITTEE:
			return {
				newTechCommitteeProposalsSubmitted: t('Profile.Settings.Notifications.newTechCommitteeProposalsSubmitted'),
				proposalsClosed: t('Profile.Settings.Notifications.proposalsClosed')
			};
		case EProposalType.COUNCIL_MOTION:
			return {
				newMotionsSubmitted: t('Profile.Settings.Notifications.newMotionsSubmitted'),
				motionInVoting: t('Profile.Settings.Notifications.motionInVoting'),
				motionClosed: t('Profile.Settings.Notifications.motionClosed')
			};
		case 'mentionsIReceive':
			return undefined;
		default:
			return undefined;
	}
};

export const getTrackLabels = (t: (key: string) => string): Record<string, { origin: EPostOrigin; label: string }> => ({
	root: { origin: EPostOrigin.ROOT, label: t('Sidebar.Root') },
	stakingAdmin: { origin: EPostOrigin.STAKING_ADMIN, label: t('ListingPage.StakingAdmin') },
	auctionAdmin: { origin: EPostOrigin.AUCTION_ADMIN, label: t('Sidebar.AuctionAdmin') },
	treasurer: { origin: EPostOrigin.TREASURER, label: t('Sidebar.Treasurer') },
	referendumCanceller: { origin: EPostOrigin.REFERENDUM_CANCELLER, label: t('Sidebar.ReferendumCanceller') },
	referendumKiller: { origin: EPostOrigin.REFERENDUM_KILLER, label: t('Sidebar.ReferendumKiller') },
	leaseAdmin: { origin: EPostOrigin.LEASE_ADMIN, label: t('Sidebar.LeaseAdmin') },
	memberReferenda: { origin: EPostOrigin.MEMBERS, label: t('Sidebar.members') },
	smallTipper: { origin: EPostOrigin.SMALL_TIPPER, label: t('Sidebar.SmallTipper') },
	bigTipper: { origin: EPostOrigin.BIG_TIPPER, label: t('Sidebar.BigTipper') },
	smallSpender: { origin: EPostOrigin.SMALL_SPENDER, label: t('Sidebar.SmallSpender') },
	mediumSpender: { origin: EPostOrigin.MEDIUM_SPENDER, label: t('Sidebar.MediumSpender') },
	bigSpender: { origin: EPostOrigin.BIG_SPENDER, label: t('Sidebar.BigSpender') },
	fellowshipAdmin: { origin: EPostOrigin.FELLOWSHIP_ADMIN, label: t('Sidebar.FellowshipAdmin') },
	generalAdmin: { origin: EPostOrigin.GENERAL_ADMIN, label: t('Sidebar.GeneralAdmin') },
	whitelistedCaller: { origin: EPostOrigin.WHITELISTED_CALLER, label: t('Sidebar.WhitelistedCaller') }
});

export const getGov1Labels = (t: (key: string) => string): Record<string, { label: string }> => ({
	mentionsIReceive: { label: t('Profile.Settings.Notifications.mentionsIReceive') },
	[EProposalType.REFERENDUM]: { label: t('Sidebar.referenda') },
	[EProposalType.BOUNTY]: { label: t('Sidebar.bounty') },
	[EProposalType.TIP]: { label: t('Sidebar.tips') },
	[EProposalType.COUNCIL_MOTION]: { label: t('Sidebar.motions') },
	[EProposalType.DEMOCRACY_PROPOSAL]: { label: t('Sidebar.proposals') },
	[EProposalType.CHILD_BOUNTY]: { label: t('Sidebar.childBounties') },
	[EProposalType.TECHNICAL_COMMITTEE]: { label: t('Sidebar.techComm') }
});

export const getNetworkLogo = (networkId: string): string => {
	const logoMap: Record<string, string> = {
		polkadot: PolkadotLogo.src,
		kusama: KusamaLogo.src,
		moonbeam: MoonbeamLogo.src,
		moonriver: MoonriverLogo.src,
		collectives: CollectivesLogo.src,
		pendulum: PendulumLogo.src,
		cere: CereLogo.src,
		polkadex: PolkadexLogo.src,
		polymesh: PolymeshLogo.src,
		'polymesh-test': PolymeshLogo.src,
		moonbase: MoonbaseLogo.src,
		'moonbase-alpha': MoonbaseLogo.src,
		westend: WestendLogo.src,
		paseo: PaseoLogo.src
	};

	return logoMap[networkId.toLowerCase()] || PolkadotLogo.src;
};
