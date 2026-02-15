# Hadith Seed Script

This script seeds the database with the **Kutub al-Sittah** (The Six Authentic Books) - the most authentic collections of hadith in Islamic tradition.

## Collections Included

1. **Sahih al-Bukhari** (صحيح البخاري) - Imam Muhammad al-Bukhari
2. **Sahih Muslim** (صحيح مسلم) - Imam Muslim ibn al-Hajjaj
3. **Sunan Abu Dawud** (سنن أبي داود) - Imam Abu Dawud al-Sijistani
4. **Jami at-Tirmidhi** (جامع الترمذي) - Imam Muhammad at-Tirmidhi
5. **Sunan an-Nasa'i** (سنن النسائي) - Imam Ahmad an-Nasa'i
6. **Sunan Ibn Majah** (سنن ابن ماجه) - Imam Ibn Majah al-Qazwini

## Data Included

- **60+ authentic hadiths** with Arabic text and English translations
- **Narrators** (Sahaba who transmitted the hadith)
- **Authentication grades** (Sahih or Hasan)
- **Book/chapter references** for each hadith
- **Complete collection metadata** (compiler, description, total hadith count)

## Usage

### Run the seed script:

```bash
npm run db:seed:hadiths
```

Or directly with tsx:

```bash
npx tsx server/scripts/seed-hadiths.ts
```

### Prerequisites:

1. Ensure `DATABASE_URL` is set in your `.env` file
2. Run database migrations first: `npm run db:push`
3. The script uses `onConflictDoNothing()` so it's safe to run multiple times

## Database Tables

The script populates two tables:

### `hadith_collections`
- Collection metadata (6 major collections)
- Compiler information
- Total hadith counts

### `hadiths`
- Individual hadith texts (60+ hadiths)
- Arabic + English translations
- Narrator chains
- Authentication grades
- Chapter/book references

## Sample Hadiths

The seed includes fundamental hadiths covering:

- **Faith and Belief** - "Actions are by intentions..."
- **Good Character** - "The strong person controls his anger..."
- **Knowledge** - "Seeking knowledge is obligatory..."
- **Brotherhood** - "The believers are like one body..."
- **Charity** - "Every act of kindness is charity..."
- **Business Ethics** - "The truthful merchant is with the Prophets..."
- **Social Conduct** - "Speak good or remain silent..."

## Authentication

All hadiths are authenticated as either:
- **Sahih** (صحيح) - Authentic
- **Hasan** (حسن) - Good/Acceptable

These grades represent the highest standards of hadith authentication.

## Future Enhancements

To expand the hadith database:

1. Add more hadiths from each collection
2. Include hadith commentary (sharh)
3. Add search/filter endpoints
4. Implement user bookmarking
5. Add topic/category tagging

## References

All hadiths are referenced with:
- Collection name
- Book/chapter number
- Hadith number
- Standard academic citation format

Example: `Sahih al-Bukhari 1`, `Sahih Muslim 2564`
