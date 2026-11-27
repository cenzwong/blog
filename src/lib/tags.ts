/** Keep existing ASCII routes stable while retaining Unicode letters and digits. */
export function tagSlug(tag: string): string {
  return tag.normalize('NFKC').trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
}
