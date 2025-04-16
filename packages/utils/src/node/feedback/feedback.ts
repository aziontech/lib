import signale from 'signale';

const cleanOutputEnabled = process.env.CLEAN_OUTPUT_MODE === 'true';
const cleanOutputConfig = {
  displayScope: false,
  displayBadge: false,
  displayDate: false,
  displayFilename: false,
  displayLabel: false,
  displayTimestamp: false,
  underlineLabel: false,
  underlineMessage: false,
  underlinePrefix: false,
  underlineSuffix: false,
  uppercaseLabel: false,
};

/**
 * Helper function to create a custom interactive logger object.
 */
const getLogger = (options = {}) => {
  const logger = new signale.Signale({ ...options });
  if (cleanOutputEnabled) {
    logger.config(cleanOutputConfig);
  }
  return Object.assign(logger, {
    breakInteractiveChain: () => console.log(),
  });
};

const methods = {
  deployed: {
    badge: '🚀',
    color: 'green',
    label: 'forged',
    logLevel: 'info',
  },
  option: {
    badge: '📦',
    color: 'green',
    label: '',
    logLevel: 'info',
  },
};

const global = (scope: string = 'Azion') => {
  return new signale.Signale({
    interactive: false,
    scope: scope,
    types: methods,
  });
};

if (cleanOutputEnabled) {
  global().config(cleanOutputConfig);
}

/**
 * Predefined log scopes.
 */
const scopes = (scope: string = 'Azion') => ({
  ...global(scope),
  interactive: {
    ...getLogger({
      interactive: true,
      scope: [scope],
      types: methods,
    }),
  },
  server: {
    ...global(scope).scope(scope, 'Server'),
    interactive: getLogger({
      interactive: true,
      scope: [scope, 'Server'],
      types: methods,
    }),
  },
  runtime: {
    ...global(scope).scope(scope, 'Runtime'),
    interactive: getLogger({
      interactive: true,
      scope: [scope, 'Runtime'],
      types: methods,
    }),
  },
  prebuild: {
    ...global(scope).scope(scope, 'Pre-Build'),
    interactive: getLogger({
      interactive: true,
      scope: [scope, 'Pre-Build'],
      types: methods,
    }),
  },
  build: {
    ...global(scope).scope(scope, 'Build'),
    interactive: getLogger({
      interactive: true,
      scope: [scope, 'Build'],
      types: methods,
    }),
  },
  postbuild: {
    ...global(scope).scope(scope, 'Post-Build'),
    interactive: getLogger({
      interactive: true,
      scope: [scope, 'Post-build'],
      types: methods,
    }),
  },
  manifest: {
    ...global(scope).scope(scope, 'IaC'),
    interactive: getLogger({
      interactive: true,
      scope: [scope, 'IaC'],
      types: methods,
    }),
  },
});

/**
 * @function
 * @memberof Utils
 * @description Feedback object that facilitates log display.
 * It includes all logging methods provided by 'signale'.
 * If the environment variable CLEAN_OUTPUT_MODE is set to 'true', all log methods use console.log,
 * providing cleaner and unstyled output. This is particularly useful
 * for other clients intending to use Vulcan
 * in the background, where stylized console output may be less desirable.
 * For more information about the Signale logging methods, refer to its documentation (https://github.com/klaussinani/signale).
 */
const feedback = {
  ...scopes(),
  globalScope: (scope?: string) => ({ ...scopes(scope) }),
};

export default feedback;
