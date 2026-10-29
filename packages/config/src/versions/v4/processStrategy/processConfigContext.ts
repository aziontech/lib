import type { AzionConfig } from '../../../types';
import SharedProcessConfigContext from '../../shared/processStrategy/processConfigContext';

/**
 * ProcessConfigContext
 * @class
 * @description Context of the v4 process config.
 */
class ProcessConfigContext extends SharedProcessConfigContext<AzionConfig> {}

export default ProcessConfigContext;
