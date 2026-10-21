import { createHymnbookPackage } from '../data/hymns/catalog';
import { validateSongbookPackage } from '../domain/songbookPackage';

export const traditionalChristianHymns = validateSongbookPackage(createHymnbookPackage('book1'));
export const christianHymnsContemporary = validateSongbookPackage(createHymnbookPackage('book2'));
export const builtInHymnbooks = [traditionalChristianHymns, christianHymnsContemporary] as const;
