/**
 * Banners for build outputs
 */

/**
 * CLI banner for production builds
 */
export const bannerCli = `
/**
 * Built with Azion CLI
 * For more information, visit: https://www.azion.com/en/documentation/products/cli/
 */
`;

/**
 * Development warning banner
 */
export const bannerDevelopment = `
/**
 * WARNING: DEVELOPMENT BUILD
 * 
 * This file is a development build and contains additional injected code
 * to facilitate the development and debugging process.
 * 
 * IMPORTANT NOTICES:
 * - DO NOT use this build in a production environment.
 * - The injected code may cause unexpected behaviors in production.
 * - Performance of this build is not optimized for production use.
 * - This build may include sensitive debugging information.
 * 
 * To generate an optimized and secure production build use 'azion build'.
 * 
 * If you are seeing this message in a production environment, stop immediately
 * and replace this file with a proper production build.
 * 
 * For any issues or questions, please refer to the documentation or contact
 * the development team.
 */
`;

export default {
  bannerCli,
  bannerDevelopment,
};
