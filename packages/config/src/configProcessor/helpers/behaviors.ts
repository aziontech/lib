/* eslint-disable @typescript-eslint/no-explicit-any */
export const requestBehaviors = {
  setEdgeConnector: {
    transform: (value: any, payloadCDN: any) => {
      const connectorName = typeof value === 'string' ? value : value.name;
      const connector = payloadCDN.edgeConnectors?.find((o: any) => o.name === connectorName);
      if (!connector) {
        throw new Error(`Rule setEdgeConnector '${connectorName}' not found in the edge connectors list`);
      }

      return {
        name: 'set_edge_connector',
        argument: connector.name,
      };
    },
  },
  rewrite: {
    transform: (value: any) => {
      const behaviors = [];
      behaviors.push({
        name: 'rewrite_request',
        argument: value,
      });
      return behaviors;
    },
  },
  deliver: {
    transform: () => ({
      name: 'deliver',
      argument: null,
    }),
  },
  setCookie: {
    transform: (value: any) => ({
      name: 'add_request_cookie',
      argument: value,
    }),
  },
  setHeaders: {
    transform: (value: any) =>
      value.map((header: any) => ({
        name: 'add_request_header',
        argument: header,
      })),
  },
  setCache: {
    transform: (value: any, payloadCDN: any) => {
      if (typeof value === 'string') {
        return {
          name: 'set_cache_policy',
          argument: value,
        };
      }
      if (typeof value === 'object') {
        payloadCDN.cache = payloadCDN.cache || [];
        const cacheSetting = {
          name: value.name,
          ...value,
        };
        payloadCDN.cache.push(cacheSetting);
        return {
          name: 'set_cache_policy',
          argument: value.name,
        };
      }
      return undefined;
    },
  },
  forwardCookies: {
    transform: (value: any) => {
      if (value) {
        return {
          name: 'forward_cookies',
          argument: null,
        };
      }
      return undefined;
    },
  },
  runFunction: {
    transform: (value: string) => ({
      name: 'run_function',
      argument: value,
    }),
  },
  enableGZIP: {
    transform: (value: any) => {
      if (value) {
        return {
          name: 'enable_gzip',
          argument: '',
        };
      }
      return undefined;
    },
  },
  bypassCache: {
    transform: (value: any) => {
      if (value) {
        return {
          name: 'bypass_cache_phase',
          argument: null,
        };
      }
      return undefined;
    },
  },
  httpToHttps: {
    transform: (value: any) => {
      if (value) {
        return {
          name: 'redirect_http_to_https',
          argument: null,
        };
      }
      return undefined;
    },
  },
  redirectTo301: {
    transform: (value: any) => ({
      name: 'redirect_to_301',
      argument: value,
    }),
  },
  redirectTo302: {
    transform: (value: any) => ({
      name: 'redirect_to_302',
      argument: value,
    }),
  },
  capture: {
    transform: (value: any) => ({
      name: 'capture_match_groups',
      argument: {
        regex: value.match,
        captured_array: value.captured,
        subject: `\${${value.subject ?? 'uri'}}`,
      },
    }),
  },
  filterCookie: {
    transform: (value: any) => ({
      name: 'filter_request_cookie',
      argument: value,
    }),
  },
  filterHeader: {
    transform: (value: any) => ({
      name: 'filter_request_header',
      argument: value,
    }),
  },
  noContent: {
    transform: (value: any) => {
      if (value) {
        return {
          name: 'no_content',
          argument: null,
        };
      }
      return undefined;
    },
  },
  optimizeImages: {
    transform: (value: any) => {
      if (value) {
        return {
          name: 'optimize_images',
          argument: null,
        };
      }
      return undefined;
    },
  },
  deny: {
    transform: (value: any) => {
      if (value) {
        return {
          name: 'deny',
          argument: null,
        };
      }
      return undefined;
    },
  },
};
export const responseBehaviors = {
  setCookie: {
    transform: (value: any) => ({
      name: 'set_cookie',
      argument: value,
    }),
  },
  setHeaders: {
    transform: (value: any) =>
      value.map((header: any) => ({
        name: 'add_response_header',
        argument: header,
      })),
  },
  enableGZIP: {
    transform: (value: any) => {
      if (value) {
        return {
          name: 'enable_gzip',
          argument: '',
        };
      }
      return undefined;
    },
  },
  filterCookie: {
    transform: (value: any) => ({
      name: 'filter_response_cookie',
      argument: value,
    }),
  },
  filterHeader: {
    transform: (value: any) => ({
      name: 'filter_response_header',
      argument: value,
    }),
  },
  runFunction: {
    transform: (value: string) => ({
      name: 'run_function',
      argument: value,
    }),
  },
  redirectTo301: {
    transform: (value: any) => ({
      name: 'redirect_to_301',
      argument: value,
    }),
  },
  redirectTo302: {
    transform: (value: any) => ({
      name: 'redirect_to_302',
      argument: value,
    }),
  },
  capture: {
    transform: (value: any) => ({
      name: 'capture_match_groups',
      argument: {
        regex: value.match,
        captured_array: value.captured,
        subject: `\${${value.subject ?? 'uri'}}`,
      },
    }),
  },
  deliver: {
    transform: (value: any) => {
      if (value) {
        return {
          name: 'deliver',
          argument: null,
        };
      }
      return undefined;
    },
  },
};

export const revertRequestBehaviors = {
  set_edge_connector: {
    transform: (value: any, payloadCDN: any) => {
      const connector = payloadCDN.edgeConnectors?.find((o: any) => o.name === value);
      if (!connector) {
        throw new Error(`Rule setEdgeConnector name '${value.name}' not found in the edge connectors list`);
      }
      return {
        setEdgeConnector: value,
      };
    },
  },
  rewrite_request: {
    transform: (value: any) => {
      return {
        rewrite: value,
      };
    },
  },
  deliver: {
    transform: () => ({
      deliver: true,
    }),
  },
  add_request_cookie: {
    transform: (value: any) => ({
      setCookie: value,
    }),
  },
  add_request_header: {
    transform: (value: any) => ({
      setHeaders: [value],
    }),
  },
  set_cache_policy: {
    transform: (value: any) => {
      if (typeof value === 'string') {
        return {
          setCache: value,
        };
      }
      if (typeof value === 'object') {
        const cacheSetting = {
          name: value.name,
          ...value,
        };
        return {
          setCache: cacheSetting,
        };
      }
      return undefined;
    },
  },
  forward_cookies: {
    transform: () => {
      return {
        forwardCookies: true,
      };
    },
  },
  run_function: {
    transform: (value: any) => ({
      runFunction: value,
    }),
  },
  enable_gzip: {
    transform: () => {
      return {
        enableGZIP: true,
      };
    },
  },
  bypass_cache_phase: {
    transform: () => {
      return {
        bypassCache: true,
      };
    },
  },
  redirect_http_to_https: {
    transform: () => {
      return {
        httpToHttps: true,
      };
    },
  },
  redirect_to_301: {
    transform: (value: any) => ({
      redirectTo301: value,
    }),
  },
  redirect_to_302: {
    transform: (value: any) => ({
      redirectTo302: value,
    }),
  },
  capture_match_groups: {
    transform: (value: any) => ({
      capture: {
        match: value.regex,
        captured: value.captured_array,
        subject: value.subject,
      },
    }),
  },
  filter_request_cookie: {
    transform: (value: any) => ({
      filterCookie: value,
    }),
  },
  filter_request_header: {
    transform: (value: any) => ({
      filterHeader: value,
    }),
  },
  no_content: {
    transform: () => {
      return {
        noContent: true,
      };
    },
  },
  optimize_images: {
    transform: () => {
      return {
        optimizeImages: true,
      };
    },
  },
  deny: {
    transform: () => {
      return {
        deny: true,
      };
    },
  },
};

export const revertResponseBehaviors = {
  set_cookie: {
    transform: (value: any) => ({
      setCookie: value,
    }),
  },
  add_response_header: {
    transform: (value: any) => ({
      setHeaders: [value],
    }),
  },
  enable_gzip: {
    transform: () => {
      return {
        enableGZIP: true,
      };
    },
  },
  filter_response_cookie: {
    transform: (value: any) => ({
      filterCookie: value,
    }),
  },
  filter_response_header: {
    transform: (value: any) => ({
      filterHeader: value,
    }),
  },
  run_function: {
    transform: (value: any) => ({
      runFunction: value,
    }),
  },
  redirect_to_301: {
    transform: (value: any) => ({
      redirectTo301: value,
    }),
  },
  redirect_to_302: {
    transform: (value: any) => ({
      redirectTo302: value,
    }),
  },
  deliver: {
    transform: () => ({
      deliver: true,
    }),
  },
};
