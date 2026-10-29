import type { AzionConfig } from '../../../types';
import SharedProcessConfigStrategy from '../../shared/processStrategy/processConfigStrategy';

/**
 * ProcessConfigStrategy
 * @class ProcessConfigStrategy
 * @description Base class of the v4 process config strategies.
 */
class ProcessConfigStrategy extends SharedProcessConfigStrategy<AzionConfig> {}

export default ProcessConfigStrategy;
