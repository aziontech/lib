import { parse } from 'cookie';
import { applyHeaders, applySearchParams, isUrl, parseAcceptLanguage } from './http.js';
import { hasField } from './matcher.js';
import { applyPCREMatches, matchPCRE } from './pcre.js';
import { getNextPhase, isLocaleTrailingSlashRegex, runOrFetchBuildOutputItem } from './utils.js';

class RoutesMatcher {
  /**
   * Creates a new instance of a request matcher.
   *
   * The matcher is used to match a request to a route and run the route's middleware.
   * @param {object} routes The processed Vercel build output config routes.
   * @param {object} output Vercel build output.
   * @param {object} reqCtx Request context object; request object, assets fetcher, and execution context.
   * @param {Array} buildMetadata Information about the build to be used in the routing.
   * @returns {void} The matched set of path, status, headers, and search params.
   */
  constructor(
    /** Processed routes from the Vercel build output config. */
    routes,
    /** Vercel build output. */
    output,
    /** Request Context object for the request to match */
    reqCtx,
    buildMetadata,
  ) {
    this.routes = routes;
    this.output = output;
    this.reqCtx = reqCtx;
    this.url = new URL(reqCtx.request.url);
    this.cookies = parse(reqCtx.request.headers.get('cookie') || '');

    this.path = this.url.pathname || '/';
    this.headers = {
      normal: new Headers(),
      important: new Headers(),
    };
    this.searchParams = new URLSearchParams();
    applySearchParams(this.searchParams, this.url.searchParams);

    this.checkPhaseCounter = 0;
    this.middlewareInvoked = [];
    this.locales = new Set(buildMetadata.i18n.locales);
    this.hasIndexFunctions = buildMetadata.hasIndexFunctions;
    this.defaultLocale = buildMetadata.i18n.defaultLocale;
  }

  /**
   * Checks if a Vercel source route from the build output config matches the request.
   * @param {object} route Build output config source route.
   * @param {string} checkStatus Whether to check the status code of the route.
   * @returns {void} The source path match result if the route matches, otherwise `undefined`.
   */
  checkRouteMatch(route, checkStatus) {
    const srcMatch = matchPCRE(route.src, this.path, route.caseSensitive);
    if (!srcMatch.match) return;

    // One of the HTTP `methods` conditions must be met - skip if not met.
    if (
      route.methods &&
      !route.methods.map((m) => m.toUpperCase()).includes(this.reqCtx.request.method.toUpperCase())
    ) {
      return;
    }

    const hasFieldProps = {
      url: this.url,
      cookies: this.cookies,
      headers: this.reqCtx.request.headers,
    };

    // All `has` conditions must be met - skip if one is not met.
    if (route.has?.find((has) => !hasField(has, hasFieldProps))) {
      return;
    }

    // All `missing` conditions must not be met - skip if one is met.
    if (route.missing?.find((has) => hasField(has, hasFieldProps))) {
      return;
    }

    // Required status code must match (i.e. for error routes) - skip if not met.
    if (checkStatus && route.status !== this.status) {
      return;
    }

    // eslint-disable-next-line consistent-return
    return srcMatch;
  }

  /**
   * Processes the response from running a middleware function.
   *
   * Handles rewriting the URL and applying redirects, response headers, and overriden request headers.
   * @param {object} resp Middleware response object.
   */
  processMiddlewareResp(resp) {
    const overrideKey = 'x-middleware-override-headers';
    const overrideHeader = resp.headers.get(overrideKey);
    if (overrideHeader) {
      const overridenHeaderKeys = new Set(overrideHeader.split(',').map((h) => h.trim()));

      // eslint-disable-next-line no-restricted-syntax
      for (const key of overridenHeaderKeys.keys()) {
        const valueKey = `x-middleware-request-${key}`;
        const value = resp.headers.get(valueKey);

        if (this.reqCtx.request.headers.get(key) !== value) {
          if (value) {
            this.reqCtx.request.headers.set(key, value);
          } else {
            this.reqCtx.request.headers.delete(key);
          }
        }

        resp.headers.delete(valueKey);
      }

      resp.headers.delete(overrideKey);
    }

    const rewriteKey = 'x-middleware-rewrite';
    const rewriteHeader = resp.headers.get(rewriteKey);
    if (rewriteHeader) {
      const newUrl = new URL(rewriteHeader, this.url);
      this.path = newUrl.pathname;
      applySearchParams(this.searchParams, newUrl.searchParams);

      resp.headers.delete(rewriteKey);
    }

    const middlewareNextKey = 'x-middleware-next';
    const middlewareNextHeader = resp.headers.get(middlewareNextKey);
    if (middlewareNextHeader) {
      resp.headers.delete(middlewareNextKey);
    } else if (!rewriteHeader && !resp.headers.has('location')) {
      // We should set the final response body and status to the middleware's if it does not want
      // to continue and did not rewrite/redirect the URL.
      this.body = resp.body;
      this.status = resp.status;
    }

    applyHeaders(this.headers.normal, resp.headers);
    this.headers.middlewareLocation = resp.headers.get('location');
  }

  /**
   * Runs the middleware function for a route if it exists.
   * @param {string} path Path to the route's middleware function.
   * @returns {boolean} Whether the middleware function was run successfully.
   */
  async runRouteMiddleware(path) {
    // If there is no path, return true as it did not result in an error.
    if (!path) return true;

    const item = path && this.output[path];
    if (!item || item.type !== 'middleware') {
      // The middleware function could not be found. Set the status to 500 and bail out.
      this.status = 500;
      return false;
    }

    const resp = await runOrFetchBuildOutputItem(item, this.reqCtx, {
      path: this.path,
      searchParams: this.searchParams,
      headers: this.headers,
      status: this.status,
    });
    this.middlewareInvoked.push(path);

    if (resp.status === 500) {
      // The middleware function threw an error. Set the status and bail out.
      this.status = resp.status;
      return false;
    }

    this.processMiddlewareResp(resp);
    return true;
  }

  /**
   * Resets the response status and headers if the route should override them.
   * @param {object} route Build output config source route.
   */
  applyRouteOverrides(route) {
    if (!route.override) return;

    this.status = undefined;
    this.headers.normal = new Headers();
    this.headers.important = new Headers();
  }

  /**
   * Applies the route's headers for the response object.
   * @param {object} route Build output config source route.
   * @param {object[]} srcMatch Matches from the PCRE matcher.
   * @param {string[]}captureGroupKeys Named capture group keys from the PCRE matcher.
   */
  applyRouteHeaders(route, srcMatch, captureGroupKeys) {
    if (!route.headers) return;

    applyHeaders(this.headers.normal, route.headers, {
      match: srcMatch,
      captureGroupKeys,
    });

    if (route.important) {
      applyHeaders(this.headers.important, route.headers, {
        match: srcMatch,
        captureGroupKeys,
      });
    }
  }

  /**
   * Applies the route's status code for the response object.
   * @param {object} route Build output config source route.
   */
  applyRouteStatus(route) {
    if (!route.status) return;

    this.status = route.status;
  }

  /**
   * Applies the route's destination for the matching the path to the Vercel build output.
   * @param {object} route Build output config source route.
   * @param {object} srcMatch Matches from the PCRE matcher.
   * @param {string[]} captureGroupKeys Named capture group keys from the PCRE matcher.
   * @returns {string }The previous path for the route before applying the destination.
   */
  applyRouteDest(route, srcMatch, captureGroupKeys) {
    // Note: In some projects that have i18n routes in the configuration and in the build process
    // they generate function type routes for '/' and '/index' in the build output,
    // a conflict occurs in the routing and the non-default i18n routes return 404. In these cases ,
    // it is necessary to check the existence of these routes and whether the locales match the current path.
    if (this.locales.has(this.path.replace('/', '')) && this.hasIndexFunctions.length > 0) {
      this.path = `${this.path}/`;
    }

    // Note: In some projects, the combination of dynamic routes, i18n and getStaticPaths
    // with fallback blocking may generate error 500 when the '/' route is called.
    // To fix this, you need to check if the default locale is the same as the target.
    if (!route.dest || this.defaultLocale === route.dest?.replace('/', '')) {
      return this.path;
    }

    const prevPath = this.path;

    this.path = applyPCREMatches(route.dest, srcMatch, captureGroupKeys);

    // NOTE: Special handling for `/index` RSC routes. Sometimes the Vercel build output config
    // has a record to rewrite `^/` to `/index.rsc`, however, this will hit requests to pages
    // that aren't `/`. In this case, we should check that the previous path is `/`.
    if (/\/index\.rsc$/i.test(this.path) && !/\/(?:index)?$/i.test(prevPath)) {
      this.path = prevPath;
    }

    // NOTE: Special handling for `.rsc` requests. If the Vercel CLI failed to generate an RSC
    // version of the page and the build output config has a record mapping the request to the
    // RSC variant, we should strip the `.rsc` extension from the path.
    const isRsc = /\.rsc$/i.test(this.path);
    const pathExistsInOutput = this.path in this.output;
    if (isRsc && !pathExistsInOutput) {
      this.path = this.path.replace(/\.rsc/i, '');
    }

    // Merge search params for later use when serving a response.
    const destUrl = new URL(this.path, this.url);
    applySearchParams(this.searchParams, destUrl.searchParams);

    // If the new dest is not an URL, update the path with the path from the URL.
    if (!isUrl(this.path)) this.path = destUrl.pathname;

    return prevPath;
  }

  /**
   * Applies the route's redirects for locales and internationalization.
   * @param {void} route Build output config source route.
   */
  applyLocaleRedirects(route) {
    if (!route.locale?.redirect) return;
    if (!this.locales) this.locales = {};

    // Automatic locale detection is only supposed to occur at the root. However, the build output
    // sometimes uses `/` as the regex instead of `^/$`. So, we should check if the `route.src` is
    // equal to the path if it is not a regular expression, to determine if we are at the root.
    // https://nextjs.org/docs/pages/building-your-application/routing/internationalization#automatic-locale-detection
    const srcIsRegex = /^\^(.)*$/.test(route.src);
    if (!srcIsRegex && route.src !== this.path) return;

    // If we already have a location header set, we might have found a locale redirect earlier.
    if (this.headers.normal.has('location')) return;

    const {
      locale: { redirect: redirects, cookie: cookieName },
    } = route;

    const cookieValue = cookieName && this.cookies[cookieName];
    const cookieLocales = parseAcceptLanguage(cookieValue ?? '');

    const headerLocales = parseAcceptLanguage(this.reqCtx.request.headers.get('accept-language') ?? '');

    // Locales from the cookie take precedence over the header.
    const locales = [...cookieLocales, ...headerLocales];

    const redirectLocales = locales.map((locale) => redirects[locale]).filter(Boolean);

    const redirectValue = redirectLocales[0];
    if (redirectValue) {
      const needsRedirecting = !this.path.startsWith(redirectValue);
      if (needsRedirecting) {
        this.headers.normal.set('location', redirectValue);
        this.status = 307;
      }
    }
  }

  /**
   * Modifies the source route's `src` regex to be friendly with previously found locale's in the
   * `miss` phase.
   *
   * Sometimes, there is a source route with `src: '/{locale}'`, which rewrites all paths containing
   * the locale to `/`. This is problematic for matching, and should only do this if the path is
   * exactly the locale, i.e. `^/{locale}$`.
   * @param {object} route Build output config source route.
   * @param {object} phase Current phase of the routing process.
   * @returns {object} The route with the locale friendly regex.
   */
  getLocaleFriendlyRoute(route, phase) {
    if (!this.locales || phase !== 'miss') {
      return route;
    }

    const isLocaleIndex = /^\//.test(route.src) && route.src.slice(1) in this.locales;
    if (isLocaleIndex) {
      return { ...route, src: `^${route.src}$` };
    }

    if (isLocaleTrailingSlashRegex(route.src, this.locales)) {
      return { ...route, src: route.src.replace(/\/\(\.\*\)$/, '(?:/(.*))?$') };
    }

    return route;
  }

  /**
   * Checks a route to see if it matches the current request.
   * @param {object} phase Current phase of the routing process.
   * @param {object} rawRoute Build output config source route.
   * @returns {Promise}The status from checking the route.
   */
  async checkRoute(phase, rawRoute) {
    const route = this.getLocaleFriendlyRoute(rawRoute, phase);
    const routeMatch = this.checkRouteMatch(route, phase === 'error');

    // If this route doesn't match, continue to the next one.
    if (!routeMatch?.match) return 'skip';

    // If this route is a middleware route, check if it has already been invoked.
    if (route.middlewarePath && this.middlewareInvoked.includes(route.middlewarePath)) {
      return 'skip';
    }

    const { match: srcMatch, captureGroupKeys } = routeMatch;

    // If this route overrides, replace the response headers and status.
    this.applyRouteOverrides(route);

    // If this route has a locale, apply the redirects for it.
    this.applyLocaleRedirects(route);

    // Call and process the middleware if this is a middleware route.
    const success = await this.runRouteMiddleware(route.middlewarePath);
    if (!success) return 'error';
    // If the middleware set a response body, we are done.
    if (this.body !== undefined) return 'done';

    // Update final headers with the ones from this route.
    this.applyRouteHeaders(route, srcMatch, captureGroupKeys);

    // Update the status code if this route has one.
    this.applyRouteStatus(route);

    // Update the path with the new destination.
    const prevPath = this.applyRouteDest(route, srcMatch, captureGroupKeys);

    // If `check` is required and the path isn't a URL, check it again.
    if (route.check && !isUrl(this.path)) {
      if (prevPath === this.path) {
        // NOTE: If the current/rewritten path is the same as the one that entered the phase, it
        // can cause an infinite loop. Therefore, we should just set the status to `404` instead
        // when we are in the `miss` phase. Otherwise, we should continue to the next phase.
        // This happens with invalid `/_next/static/...` and `/_next/data/...` requests.

        if (phase !== 'miss') {
          // eslint-disable-next-line no-return-await
          return await this.checkPhase(getNextPhase(phase));
        }

        this.status = 404;
      } else if (phase === 'miss') {
        // When in the `miss` phase, enter `filesystem` if the file is not in the build output. This
        // avoids rewrites in `none` that do the opposite of those in `miss`, and would cause infinite
        // loops (e.g. i18n). If it is in the build output, remove a potentially applied `404` status.
        if (!(this.path in this.output)) {
          // eslint-disable-next-line no-return-await
          return await this.checkPhase('filesystem');
        }

        if (this.status === 404) {
          this.status = undefined;
        }
      } else {
        // In all other instances, we need to enter the `none` phase so we can ensure that requests
        // for the `RSC` variant of pages are served correctly.
        // eslint-disable-next-line no-return-await
        return await this.checkPhase('none');
      }
    }

    // If we found a match and shouldn't continue finding matches, break out of the loop.
    if (!route.continue) {
      return 'done';
    }

    return 'next';
  }

  /**
   * Checks a phase from the routing process to see if any route matches the current request.
   * @param {object} phase Current phase for routing.
   * @returns {Promise} The status from checking the phase.
   */
  async checkPhase(phase) {
    if (this.checkPhaseCounter++ >= 50) {
      // eslint-disable-next-line no-console
      console.error(`Routing encountered an infinite loop while checking ${this.url.pathname}`);
      this.status = 500;
      return 'error';
    }

    // Reset the middleware invoked list as this is a new phase.
    this.middlewareInvoked = [];
    let shouldContinue = true;

    // eslint-disable-next-line no-restricted-syntax
    for (const route of this.routes[phase]) {
      // eslint-disable-next-line no-await-in-loop
      const result = await this.checkRoute(phase, route);

      if (result === 'error') {
        return 'error';
      }

      if (result === 'done') {
        shouldContinue = false;
        break;
      }
    }

    // In the `hit` phase or for external urls/redirects, return the match.
    if (phase === 'hit' || isUrl(this.path) || this.headers.normal.has('location')) {
      return 'done';
    }

    if (phase === 'none') {
      // applications using the Pages router with i18n plus a catch-all root route
      // redirect all requests (including /api/ ones) to the catch-all route, the only
      // way to prevent this erroneous behavior is to remove the locale here if the
      // path without the locale exists in the vercel build output
      // eslint-disable-next-line no-restricted-syntax
      for (const locale of this.locales) {
        const localeRegExp = new RegExp(`/${locale}(/.*)`);
        const match = this.path.match(localeRegExp);
        const pathWithoutLocale = match?.[1];
        if (pathWithoutLocale && pathWithoutLocale in this.output) {
          this.path = pathWithoutLocale;
          break;
        }
      }
    }

    let pathExistsInOutput = this.path in this.output;

    // If a path with a trailing slash entered the `rewrite` phase and didn't find a match, it might
    // be due to the `trailingSlash` setting in `next.config.js`. Therefore, we should remove the
    // trailing slash and check again before entering the next phase.
    if (phase === 'rewrite' && !pathExistsInOutput && this.path.endsWith('/')) {
      const newPath = this.path.replace(/\/$/, '');
      pathExistsInOutput = newPath in this.output;
      if (pathExistsInOutput) {
        this.path = newPath;
      }
    }

    // In the `miss` phase, set status to 404 if no path was found and it isn't an error code.
    if (phase === 'miss' && !pathExistsInOutput) {
      const should404 = !this.status || this.status < 400;
      this.status = should404 ? 404 : this.status;
    }

    let nextPhase = 'miss';
    if (pathExistsInOutput || phase === 'miss' || phase === 'error') {
      // If the route exists, enter the `hit` phase. For `miss` and `error` phases, enter the `hit`
      // phase to update headers (e.g. `x-matched-path`).
      nextPhase = 'hit';
    } else if (shouldContinue) {
      nextPhase = getNextPhase(phase);
    }

    // eslint-disable-next-line no-return-await
    return await this.checkPhase(nextPhase);
  }

  /**
   * Runs the matcher for a phase.
   * @param {string} phase The phase to start matching routes from.
   * @returns {Promise} The status from checking for matches.
   */
  async run(phase = 'none') {
    // Reset the counter for each run.
    this.checkPhaseCounter = 0;
    const result = await this.checkPhase(phase);

    // Check if path is an external URL.
    if (isUrl(this.path)) {
      this.headers.normal.set('location', this.path);
    }

    // Update status to redirect user to external URL.
    if (this.headers.normal.has('location') && (!this.status || this.status < 300 || this.status >= 400)) {
      this.status = 307;
    }

    return result;
  }
}

export { RoutesMatcher };
