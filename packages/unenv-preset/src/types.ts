export interface Environment {
  alias: { [key: string]: string };
  inject: { [key: string]: string | string[] };
  polyfill: string[];
  external: string[];
}

export interface Preset {
  meta?: {
    /**
     * Preset name.
     */
    readonly name?: string;

    /**
     * Preset version.
     */
    readonly version?: string;

    /**
     * Path or URL to preset entry (used for resolving absolute paths).
     */
    readonly url?: string | URL;
  };

  alias?: Environment['alias'];
  // inject's value is nullable to support overrides/subtraction
  inject?: { [key: string]: string | string[] | false };
  polyfill?: Environment['polyfill'];
  external?: Environment['external'];
}
