/**
 * Common file extensions used in web applications
 */
export const FILE_EXTENSIONS = {
  // Images
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'] as const,

  // Fonts
  FONTS: ['ttf', 'otf', 'woff', 'woff2', 'eot'] as const,

  // Documents
  DOCUMENTS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'] as const,

  // Media
  MEDIA: ['mp4', 'webm', 'mp3', 'wav', 'ogg'] as const,

  // Code & Data
  CODE_AND_DATA: ['css', 'js', 'json', 'xml', 'html', 'txt', 'csv'] as const,

  // Archives
  ARCHIVES: ['zip', 'rar', '7z', 'tar', 'gz'] as const,

  // Other
  OTHER: ['webmanifest', 'map', 'md', 'yaml', 'yml'] as const,
} as const;

/**
 * All file extensions combined
 */
export const ALL_EXTENSIONS = [
  ...FILE_EXTENSIONS.IMAGES,
  ...FILE_EXTENSIONS.FONTS,
  ...FILE_EXTENSIONS.DOCUMENTS,
  ...FILE_EXTENSIONS.MEDIA,
  ...FILE_EXTENSIONS.CODE_AND_DATA,
  ...FILE_EXTENSIONS.ARCHIVES,
  ...FILE_EXTENSIONS.OTHER,
] as const;
