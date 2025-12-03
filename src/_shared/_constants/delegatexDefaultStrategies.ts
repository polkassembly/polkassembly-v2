// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Strategy1 from '@assets/delegation/klara/Strategy1.svg';
import Strategy2 from '@assets/delegation/klara/Strategy2.svg';
import Strategy3 from '@assets/delegation/klara/Strategy3.svg';
import Strategy4 from '@assets/delegation/klara/Strategy4.svg';
import { VotingStrategy } from '../types';

export const defaultStrategies: VotingStrategy[] = [
	{
		id: 'aggressive',
		name: 'Aggressive Growth',
		description: 'Prioritizes ecosystem expansion and bold initiatives',
		icon: Strategy1,
		tags: ['high-risk', 'expansion'],
		logic: 'Heavily weights growth perspective (50%) while minimizing fiscal caution. Best for bull markets and expansion phases.',
		weights: {
			balthazar: 0.3,
			caspar: 0.2,
			melchior: 0.5
		},
		commentPreview: (signature: string, contact: string) => {
			const signaturePart = signature ? ` – ${signature}` : '';
			const contactPart = contact ? `\nContact: ${contact}` : '';
			return `Voted based on aggressive growth strategy. This proposal aligns with ecosystem expansion goals and bold initiatives that drive adoption forward.${signaturePart}${contactPart}`;
		}
	},
	{
		id: 'risk-averse',
		name: 'Risk Averse',
		description: 'Focuses on treasury sustainability and proven projects',
		icon: Strategy2,
		tags: ['low-risk', 'conservative'],
		logic: 'Prioritizes fiscal responsibility (60%) over growth. Ideal for bear markets or when treasury preservation is critical.',
		weights: {
			balthazar: 0.2,
			caspar: 0.6,
			melchior: 0.2
		},
		commentPreview: (signature: string, contact: string) => {
			const signaturePart = signature ? ` – ${signature}` : '';
			const contactPart = contact ? `\nContact: ${contact}` : '';
			return `Voted with risk-averse strategy prioritizing treasury sustainability. This decision emphasizes fiscal responsibility and proven track records.${signaturePart}${contactPart}`;
		}
	},
	{
		id: 'conservative',
		name: 'Conservative',
		description: 'Balanced approach with emphasis on stability',
		icon: Strategy3,
		tags: ['balanced', 'stable'],
		logic: 'Balances fiscal caution (50%) with strategic thinking (30%). Safe default for uncertain market conditions.',
		weights: {
			balthazar: 0.3,
			caspar: 0.5,
			melchior: 0.2
		},
		commentPreview: (signature: string, contact: string) => {
			const signaturePart = signature ? ` – ${signature}` : '';
			const contactPart = contact ? `\nContact: ${contact}` : '';
			return `Voted using conservative strategy with balanced approach. This proposal meets stability criteria while maintaining fiscal prudence.${signaturePart}${contactPart}`;
		}
	},
	{
		id: 'growth-oriented',
		name: 'Growth Oriented',
		description: 'Emphasizes long-term ecosystem value',
		icon: Strategy4,
		tags: ['long-term', 'ecosystem'],
		logic: 'Maximizes growth focus (50%) while maintaining strategic balance. Optimized for ecosystem development and adoption.',
		weights: {
			balthazar: 0.3,
			caspar: 0.2,
			melchior: 0.5
		},
		commentPreview: (signature: string, contact: string) => {
			const signaturePart = signature ? ` – ${signature}` : '';
			const contactPart = contact ? `\nContact: ${contact}` : '';
			return `Voted with growth-oriented strategy. This proposal demonstrates strong potential for long-term ecosystem value and sustainable development.${signaturePart}${contactPart}`;
		}
	},
	{
		id: 'technical',
		name: 'Technical Excellence',
		description: 'Prioritizes technical merit and innovation',
		icon: Strategy1,
		tags: ['innovation', 'technical'],
		logic: 'Equal weight to strategy and fiscal analysis (40% each). Perfect for evaluating technical proposals and protocol upgrades.',
		weights: {
			balthazar: 0.4,
			caspar: 0.4,
			melchior: 0.2
		},
		commentPreview: (signature: string, contact: string) => {
			const signaturePart = signature ? ` – ${signature}` : '';
			const contactPart = contact ? `\nContact: ${contact}` : '';
			return `Voted based on technical excellence criteria. This proposal demonstrates strong technical merit, innovation, and sound implementation approach.${signaturePart}${contactPart}`;
		}
	},
	{
		id: 'community-focused',
		name: 'Community Focused',
		description: 'Values community engagement and organic growth',
		icon: Strategy2,
		tags: ['community', 'grassroots'],
		logic: 'Emphasizes growth and community impact (50%) with moderate fiscal oversight. Best for community-driven initiatives.',
		weights: {
			balthazar: 0.2,
			caspar: 0.3,
			melchior: 0.5
		},
		commentPreview: (signature: string, contact: string) => {
			const signaturePart = signature ? ` – ${signature}` : '';
			const contactPart = contact ? `\nContact: ${contact}` : '';
			return `Voted with community-focused strategy. This proposal shows strong community engagement potential and supports grassroots ecosystem development.${signaturePart}${contactPart}`;
		}
	},
	{
		id: 'treasury-watchdog',
		name: 'Treasury Watchdog',
		description: 'Strict fiscal responsibility',
		icon: Strategy3,
		tags: ['fiscal', 'strict'],
		logic: 'Maximum fiscal scrutiny (60%) with minimal growth bias. Use when treasury health is the top priority.',
		weights: {
			balthazar: 0.2,
			caspar: 0.6,
			melchior: 0.2
		},
		commentPreview: (signature: string, contact: string) => {
			const signaturePart = signature ? ` – ${signature}` : '';
			const contactPart = contact ? `\nContact: ${contact}` : '';
			return `Voted as treasury watchdog with strict fiscal oversight. This proposal meets rigorous financial criteria and demonstrates responsible resource allocation.${signaturePart}${contactPart}`;
		}
	},
	{
		id: 'validator-aligned',
		name: 'Validator Aligned',
		description: 'Supports network security and validator interests',
		icon: Strategy4,
		tags: ['security', 'infrastructure'],
		logic: 'Balances strategic and fiscal concerns (40% each). Optimized for infrastructure and network security proposals.',
		weights: {
			balthazar: 0.4,
			caspar: 0.4,
			melchior: 0.2
		},
		commentPreview: (signature: string, contact: string) => {
			const signaturePart = signature ? ` – ${signature}` : '';
			const contactPart = contact ? `\nContact: ${contact}` : '';
			return `Voted with validator-aligned strategy. This proposal supports network security, infrastructure improvements, and validator ecosystem health.${signaturePart}${contactPart}`;
		}
	},
	{
		id: 'neutral',
		name: 'Neutral',
		description: 'Equal weight to all perspectives',
		icon: Strategy1,
		tags: ['balanced', 'unbiased'],
		logic: 'Equal weight across all three agents (33% each). Provides unbiased analysis without strategic preference.',
		weights: {
			balthazar: 0.33,
			caspar: 0.33,
			melchior: 0.34
		},
		commentPreview: (signature: string, contact: string) => {
			const signaturePart = signature ? ` – ${signature}` : '';
			const contactPart = contact ? `\nContact: ${contact}` : '';
			return `Voted with neutral strategy applying equal weight to all evaluation criteria. This proposal meets balanced assessment standards across all perspectives.${signaturePart}${contactPart}`;
		}
	},
	{
		id: 'experimental',
		name: 'Experimental',
		description: 'Favors innovative and experimental proposals',
		icon: Strategy2,
		tags: ['innovation', 'high-risk'],
		logic: 'Maximizes growth perspective (60%) with minimal fiscal constraints. For cutting-edge and experimental initiatives.',
		weights: {
			balthazar: 0.25,
			caspar: 0.15,
			melchior: 0.6
		},
		commentPreview: (signature: string, contact: string) => {
			const signaturePart = signature ? ` – ${signature}` : '';
			const contactPart = contact ? `\nContact: ${contact}` : '';
			return `Voted with experimental strategy favoring innovation. This proposal represents cutting-edge thinking and has potential for breakthrough impact on the ecosystem.${signaturePart}${contactPart}`;
		}
	}
];
