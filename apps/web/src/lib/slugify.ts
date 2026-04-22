/**
 * Converts a string into a URL-friendly slug.
 * Example: "Software Engineer - Kingston" -> "software-engineer-kingston"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Ensures a slug is unique by appending a random suffix if needed.
 * In a real database scenario, this would usually check the DB.
 * For now, this is a placeholder for the logic handled in the Mongoose hook.
 */
export function generateUniqueSlug(title: string, existingSlugs: string[] = []): string {
  let slug = slugify(title);
  if (!slug) slug = 'job';
  
  let result = slug;
  let counter = 1;
  
  while (existingSlugs.includes(result)) {
    result = `${slug}-${counter}`;
    counter++;
  }
  
  return result;
}
