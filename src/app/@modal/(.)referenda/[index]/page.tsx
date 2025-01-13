// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, IPost, IErrorResponse } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { GetServerSideProps } from 'next';
import ReferendaDialog from '@ui/ListingComponent/ReferendaDialog';

interface ReferendaPageProps {
	data: IPost | null;
	error: IErrorResponse | null;
	index: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { index } = context.params as { index: string };
	const result = await NextApiClientService.fetchProposalDetailsApi(EProposalType.REFERENDUM_V2, index);

	if (result.error) {
		return {
			props: {
				data: null,
				error: result.error,
				index
			}
		};
	}

	return {
		props: {
			data: result.data,
			error: null,
			index
		}
	};
};

function Referenda({ data, error, index }: ReferendaPageProps) {
	if (error || !data) {
		return <div className='text-center text-text_primary'>{error?.message}</div>;
	}

	return (
		<ReferendaDialog
			data={data}
			index={index}
		/>
	);
}

export default Referenda;
