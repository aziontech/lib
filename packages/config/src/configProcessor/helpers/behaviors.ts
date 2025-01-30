/* eslint-disable @typescript-eslint/no-explicit-any */
export const requestBehaviors = {
  setOrigin: {
    transform: (value: any, payloadCDN: any) => {
      const origin = payloadCDN.origin.find((o: any) => o.name === value.name && o.origin_type === value.type);

      if (!origin) {
        throw new Error(`Rule setOrigin name '${value.name}' not found in the origin settings`);
      } else if (origin.origin_type !== value.type) {
        throw new Error(`Rule setOrigin originType '${value.type}' does not match the origin settings`);
      }

      return {
        name: 'set_origin',
        target: origin.name,
      };
    },
  },
  rewrite: {
    transform: (value: any) => {
      const behaviors = [];
      behaviors.push({
        name: 'rewrite_request',
        target: value,
      });
      return behaviors;
    },
  },
  deliver: {
    transform: () => ({
      name: 'deliver',
      target: null,
    }),
  },
  setCookie: {
    transform: (value: any) => ({
      name: 'add_request_cookie',
      target: value,
    }),
  },
  setHeaders: {
    transform: (value: any) =>
      value.map((header: any) => ({
        name: 'add_request_header',
        target: header,
      })),
  },
  setCache: {
    transform: (value: any, payloadCDN: any) => {
      if (typeof value === 'string') {
        return {
          name: 'set_cache_policy',
          target: value,
        };
      }
      if (typeof value === 'object') {
        const cacheSetting = {
          name: value.name,
          ...value,
        };
        payloadCDN.cache.push(cacheSetting);
        return {
          name: 'set_cache_policy',
          target: value.name,
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
          target: null,
        };
      }
      return undefined;
    },
  },
  runFunction: {
    transform: (value: any) => ({
      name: 'run_function',
      target: value.path,
    }),
  },
  enableGZIP: {
    transform: (value: any) => {
      if (value) {
        return {
          name: 'enable_gzip',
          target: '',
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
          target: null,
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
          target: null,
        };
      }
      return undefined;
    },
  },
  redirectTo301: {
    transform: (value: any) => ({
      name: 'redirect_to_301',
      target: value,
    }),
  },
  redirectTo302: {
    transform: (value: any) => ({
      name: 'redirect_to_302',
      target: value,
    }),
  },
  capture: {
    transform: (value: any) => ({
      name: 'capture_match_groups',
      target: {
        regex: value.match,
        captured_array: value.captured,
        subject: `\${${value.subject ?? 'uri'}}`,
      },
    }),
  },
  filterCookie: {
    transform: (value: any) => ({
      name: 'filter_request_cookie',
      target: value,
    }),
  },
  filterHeader: {
    transform: (value: any) => ({
      name: 'filter_request_header',
      target: value,
    }),
  },
  noContent: {
    transform: (value: any) => {
      if (value) {
        return {
          name: 'no_content',
          target: null,
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
          target: null,
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
          target: null,
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
      target: value,
    }),
  },
  setHeaders: {
    transform: (value: any) =>
      value.map((header: any) => ({
        name: 'add_response_header',
        target: header,
      })),
  },
  enableGZIP: {
    transform: (value: any) => {
      if (value) {
        return {
          name: 'enable_gzip',
          target: '',
        };
      }
      return undefined;
    },
  },
  filterCookie: {
    transform: (value: any) => ({
      name: 'filter_response_cookie',
      target: value,
    }),
  },
  filterHeader: {
    transform: (value: any) => ({
      name: 'filter_response_header',
      target: value,
    }),
  },
  runFunction: {
    transform: (value: any) => ({
      name: 'run_function',
      target: value.path,
    }),
  },
  redirectTo301: {
    transform: (value: any) => ({
      name: 'redirect_to_301',
      target: value,
    }),
  },
  redirectTo302: {
    transform: (value: any) => ({
      name: 'redirect_to_302',
      target: value,
    }),
  },
  capture: {
    transform: (value: any) => ({
      name: 'capture_match_groups',
      target: {
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
          target: null,
        };
      }
      return undefined;
    },
  },
};

export const revertRequestBehaviors = {
  set_origin: {
    transform: (value: any, payloadCDN: any) => {
      const origin = payloadCDN.origin.find((o: any) => o.name === value);
      if (!origin) {
        throw new Error(`Rule setOrigin name '${value.name}' not found in the origin settings`);
      }
      return {
        setOrigin: {
          name: value,
          type: origin.type,
        },
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
      runFunction: {
        path: value,
      },
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
      runFunction: {
        path: value,
      },
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
