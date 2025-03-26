import fs from 'fs/promises';
import path from 'path';

/**
 * Saves data to a JSON file
 * @param data - The data to save
 * @param filename - The name of the file
 * @param folderPath - Optional custom folder path
 */
export async function saveToFile<T>(
  data: T, 
  filename: string,
  folderPath?: string
): Promise<string> {
  try {
    const outputDir = folderPath || path.resolve(process.cwd(), 'output');
    
    // Ensure directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    const filePath = path.resolve(outputDir, filename);
    
    // Write data to file
    await fs.writeFile(
      filePath,
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    
    console.log(`Data successfully saved to ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Error saving data to file:', error);
    throw error;
  }
}

/**
 * Formats a date for use in filenames
 * @returns Formatted date string (YYYY-MM-DD_HH-MM-SS)
 */
export function getFormattedDate(): string {
  const now = new Date();
  return now.toISOString()
    .replace(/:/g, '-')
    .replace('T', '_')
    .replace(/\..+/, '');
}