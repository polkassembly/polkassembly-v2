// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '../_services/validator_service';
import { getSubstrateAddress } from './getSubstrateAddress';

export const getFormattedAddress = (addr: string) => (ValidatorService.isValidSubstrateAddress(addr) ? getSubstrateAddress(addr)! : addr);
