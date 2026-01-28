// extract-i18n-keys.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const https = require('https');

// Configuration
const PROJECT_ROOT = path.join(__dirname, 'src');
const OUTPUT_FILE = 'translation-keys.json';
const TRANSLATIONS_FILE = 'translations.json';
const FILE_EXTENSIONS = ['.vue'];
const EXISTING_TRANSLATION_PATTERN = /\$t\(['"`](.*?)['"`]\)/g;
const STATIC_TEXT_PATTERN = />\s*([^<>{}]+)\s*</g; // Pattern to find text between HTML tags
const SCRIPT_LABEL_PATTERN = /(title|label):\s*['"`]([^'"`]+)['"`]/g; // Pattern for title/label in script
const TRANSLATION_DELAY = 1500; // Increased delay for API limits
const MAX_RETRIES = 3;

// Initialize file system functions
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Extract template and script content from Vue files
function extractVueContent(content, filePath) {
  // Only process Vue files for template extraction
  if (!filePath.endsWith('.vue')) {
    return {
      templateContent: content,
      scriptContent: '',
      beforeTemplate: '',
      afterTemplate: '',
      beforeScript: '',
      afterScript: '',
      templateStart: 0,
      templateEnd: content.length,
      scriptStart: 0,
      scriptEnd: 0
    };
  }

  // Find template tags
  const templateStartMatch = content.match(/<template[^>]*>/i);
  const templateEndMatch = content.match(/<\/template>/i);
  
  // Find script tags
  const scriptStartMatch = content.match(/<script[^>]*>/i);
  const scriptEndMatch = content.match(/<\/script>/i);

  let templateContent = '';
  let scriptContent = '';
  let beforeTemplate = '';
  let afterTemplate = '';
  let beforeScript = '';
  let afterScript = '';
  let templateStart = 0;
  let templateEnd = 0;
  let scriptStart = 0;
  let scriptEnd = 0;

  // Extract template content
  if (templateStartMatch && templateEndMatch) {
    templateStart = templateStartMatch.index + templateStartMatch[0].length;
    templateEnd = templateEndMatch.index;
    beforeTemplate = content.substring(0, templateStart);
    templateContent = content.substring(templateStart, templateEnd);
    afterTemplate = content.substring(templateEndMatch.index);
  }

  // Extract script content
  if (scriptStartMatch && scriptEndMatch) {
    scriptStart = scriptStartMatch.index + scriptStartMatch[0].length;
    scriptEnd = scriptEndMatch.index;
    beforeScript = content.substring(0, scriptStart);
    scriptContent = content.substring(scriptStart, scriptEnd);
    afterScript = content.substring(scriptEndMatch.index);
  }

  return {
    templateContent,
    scriptContent,
    beforeTemplate,
    afterTemplate,
    beforeScript,
    afterScript,
    templateStart,
    templateEnd,
    scriptStart,
    scriptEnd
  };
}

// Format English text
function formatEnglishText(text) {
  return text
    .trim()
    .split(/[\s_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Generate translation key from component path and text
function generateTranslationKey(filePath, text) {
  // Get the component name from the file path
  const componentName = path.basename(filePath, path.extname(filePath)).toLowerCase();
  
  // Clean and format the text for the key
  const keyPart = text.trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_')    // Replace spaces with underscores
    .toLowerCase();
  
  return `${componentName}.${keyPart}`;
}

// Check if text should be excluded from translation
function shouldExcludeText(text) {
  const trimmed = text.trim();
  // Exclude empty text, single characters, or text that's already a translation key
  return !trimmed || 
         trimmed.length <= 1 || 
         /^\$t\(.*\)$/.test(trimmed) || 
         /^[0-9.,%+-]+$/.test(trimmed) ||
         /^{{.*}}$/.test(trimmed) || // Exclude Vue interpolations
         /^this\.\$t\(/.test(trimmed); // Exclude existing this.$t() calls
}

// Process template content to find and replace static text
async function processTemplateContent(filePath, templateContent) {
  let newTemplateContent = templateContent;
  const staticTextMatches = [];
  const translationKeys = [];
  
  // Find all static text matches in template content only
  let match;
  const pattern = new RegExp(STATIC_TEXT_PATTERN.source, STATIC_TEXT_PATTERN.flags);
  while ((match = pattern.exec(templateContent)) !== null) {
    const text = match[1].trim();
    if (!shouldExcludeText(text)) {
      staticTextMatches.push({
        original: match[0],
        text: text,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }
  }
  
  // Process matches in reverse order to avoid offset issues when replacing
  for (let i = staticTextMatches.length - 1; i >= 0; i--) {
    const match = staticTextMatches[i];
    const translationKey = generateTranslationKey(filePath, match.text);
    const replacement = match.original.replace(match.text, `{{ $t("${translationKey}") }}`);
    
    newTemplateContent = newTemplateContent.substring(0, match.startIndex) + 
                         replacement + 
                         newTemplateContent.substring(match.endIndex);
    
    translationKeys.push(translationKey);
  }
  
  return {
    newTemplateContent,
    translationKeys: [...new Set(translationKeys)] // Remove duplicates
  };
}

// Process script content to find and replace static text in title/label fields
async function processScriptContent(filePath, scriptContent) {
  let newScriptContent = scriptContent;
  const staticTextMatches = [];
  const translationKeys = [];
  
  // Find all title/label matches in script content
  let match;
  const pattern = new RegExp(SCRIPT_LABEL_PATTERN.source, SCRIPT_LABEL_PATTERN.flags);
  while ((match = pattern.exec(scriptContent)) !== null) {
    const propertyName = match[1]; // 'title' or 'label'
    const text = match[2].trim();
    
    if (!shouldExcludeText(text)) {
      staticTextMatches.push({
        original: match[0],
        propertyName: propertyName,
        text: text,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }
  }
  
  // Process matches in reverse order to avoid offset issues when replacing
  for (let i = staticTextMatches.length - 1; i >= 0; i--) {
    const match = staticTextMatches[i];
    const translationKey = generateTranslationKey(filePath, match.text);
    const replacement = `${match.propertyName}: this.$t("${translationKey}")`;
    
    newScriptContent = newScriptContent.substring(0, match.startIndex) + 
                       replacement + 
                       newScriptContent.substring(match.endIndex);
    
    translationKeys.push(translationKey);
  }
  
  return {
    newScriptContent,
    translationKeys: [...new Set(translationKeys)] // Remove duplicates
  };
}

// Scan individual file for translation keys and static text
async function scanAndProcessFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Extract template and script content (only for Vue files)
    const {
      templateContent,
      scriptContent,
      beforeTemplate,
      afterTemplate,
      beforeScript,
      afterScript,
      templateStart,
      templateEnd,
      scriptStart,
      scriptEnd
    } = extractVueContent(content, filePath);
    
    // 1. Find existing translation keys in the entire file
    const existingKeys = [];
    let match;
    const existingPattern = new RegExp(EXISTING_TRANSLATION_PATTERN.source, EXISTING_TRANSLATION_PATTERN.flags);
    while ((match = existingPattern.exec(content)) !== null) {
      existingKeys.push(match[1]);
    }
    
    // 2. Find and replace static text in template content
    const { newTemplateContent, translationKeys: templateKeys } = await processTemplateContent(filePath, templateContent);
    
    // 3. Find and replace static text in script content
    const { newScriptContent, translationKeys: scriptKeys } = await processScriptContent(filePath, scriptContent);
    
    // 4. Reconstruct the full file content
    let newContent = content;
    let hasChanges = false;
    
    if (filePath.endsWith('.vue')) {
      // For Vue files, reconstruct with both template and script changes
      if (templateContent && newTemplateContent !== templateContent) {
        // Replace template content
        const beforeTemplateEnd = beforeTemplate;
        const afterTemplateStart = afterTemplate;
        newContent = beforeTemplateEnd + newTemplateContent + afterTemplateStart;
        hasChanges = true;
      }
      
      if (scriptContent && newScriptContent !== scriptContent) {
        // Replace script content in the already modified content
        const scriptStartMatch = newContent.match(/<script[^>]*>/i);
        const scriptEndMatch = newContent.match(/<\/script>/i);
        
        if (scriptStartMatch && scriptEndMatch) {
          const scriptStart = scriptStartMatch.index + scriptStartMatch[0].length;
          const scriptEnd = scriptEndMatch.index;
          const beforeScriptEnd = newContent.substring(0, scriptStart);
          const afterScriptStart = newContent.substring(scriptEnd);
          newContent = beforeScriptEnd + newScriptContent + afterScriptStart;
          hasChanges = true;
        }
      }
    } else {
      // For non-Vue files, process the entire content as before
      const { newContent: processedContent, translationKeys: nonVueKeys } = await processFileContent(filePath, content);
      newContent = processedContent;
      if (newContent !== content) {
        hasChanges = true;
        templateKeys.push(...nonVueKeys);
      }
    }
    
    // Combine all translation keys
    const allTranslationKeys = [...templateKeys, ...scriptKeys];
    
    // 5. Write the modified content back to the file if changes were made
    if (hasChanges) {
      await writeFile(filePath, newContent, 'utf8');
      console.log(`✏️  Updated ${path.relative(PROJECT_ROOT, filePath)} with ${allTranslationKeys.length} translations`);
    }
    
    return {
      file: path.relative(PROJECT_ROOT, filePath),
      existingKeys: existingKeys,
      newKeys: [...new Set(allTranslationKeys)] // Remove duplicates
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return null;
  }
}

// Process file content to find and replace static text (for non-Vue files)
async function processFileContent(filePath, content) {
  let newContent = content;
  const staticTextMatches = [];
  const translationKeys = [];
  
  // Find all static text matches
  let match;
  const pattern = new RegExp(STATIC_TEXT_PATTERN.source, STATIC_TEXT_PATTERN.flags);
  while ((match = pattern.exec(content)) !== null) {
    const text = match[1].trim();
    if (!shouldExcludeText(text)) {
      staticTextMatches.push({
        original: match[0],
        text: text,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }
  }
  
  // Process matches in reverse order to avoid offset issues when replacing
  for (let i = staticTextMatches.length - 1; i >= 0; i--) {
    const match = staticTextMatches[i];
    const translationKey = generateTranslationKey(filePath, match.text);
    const replacement = match.original.replace(match.text, `{{ $t("${translationKey}") }}`);
    
    newContent = newContent.substring(0, match.startIndex) + 
                 replacement + 
                 newContent.substring(match.endIndex);
    
    translationKeys.push(translationKey);
  }
  
  return {
    newContent,
    translationKeys: [...new Set(translationKeys)] // Remove duplicates
  };
}

// Recursively scan directory for files
async function scanAndProcessDirectory(directory) {
  try {
    const files = await readdir(directory);
    const results = [];

    for (const file of files) {
      const fullPath = path.join(directory, file);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        results.push(...await scanAndProcessDirectory(fullPath));
      } else if (FILE_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
        const result = await scanAndProcessFile(fullPath);
        if (result) results.push(result);
      }
    }

    return results;
  } catch (error) {
    console.error(`Error scanning ${directory}:`, error);
    return [];
  }
}

// Group keys by their prefix
async function groupKeysByPrefix(results) {
  const grouped = {};

  for (const file of results) {
    // Process existing keys
    for (const key of file.existingKeys) {
      const parts = key.split('.');
      if (parts.length < 2) continue;
      
      const prefix = parts[0];
      const fieldName = parts.slice(1).join('_');
      const formattedEnglish = formatEnglishText(fieldName);
      
      if (!grouped[prefix]) {
        grouped[prefix] = {
          name: prefix,
          en: new Map(),
          ar: new Map()
        };
      }
      
      grouped[prefix].en.set(fieldName, { [fieldName]: formattedEnglish });
      // Initialize Arabic with the key as both the property name and value
      grouped[prefix].ar.set(fieldName, { [fieldName]: fieldName });
    }
    
    // Process new keys
    for (const key of file.newKeys) {
      const parts = key.split('.');
      if (parts.length < 2) continue;
      
      const prefix = parts[0];
      const fieldName = parts.slice(1).join('_');
      const formattedEnglish = formatEnglishText(fieldName);
      
      if (!grouped[prefix]) {
        grouped[prefix] = {
          name: prefix,
          en: new Map(),
          ar: new Map()
        };
      }
      
      grouped[prefix].en.set(fieldName, { [fieldName]: formattedEnglish });
      // Initialize Arabic with the key as both the property name and value
      grouped[prefix].ar.set(fieldName, { [fieldName]: fieldName });
    }
  }

  return Object.values(grouped);
}

// Translate Arabic values - Modified to keep values same as keys
async function translateArabicValues(groupedKeys) {
  console.log('🌍 Skipping Arabic translations (keeping values same as keys)...');
  
  // We're not actually translating, just ensuring the structure is correct
  for (const group of groupedKeys) {
    const arEntries = Array.from(group.ar.entries());
    
    for (const [key, valueObj] of arEntries) {
      const text = Object.keys(valueObj)[0];
      // Keep the value exactly the same as the key
      group.ar.set(key, { [key]: key });
    }
  }
  
  console.log(`✅ Kept Arabic values same as keys`);
  return groupedKeys;
}

// Generate final translations structure
async function generateTranslations(groupedKeys) {
  const now = new Date().toISOString();
  
  return groupedKeys.map(group => ({
    name: group.name,
    en: Array.from(group.en.values()),
    ar: Array.from(group.ar.values()),
    updated_at: { $date: now },
    created_at: { $date: now }
  }));
}

// Translation function using native HTTPS (no external dependencies)
async function translateWithRetry(text, retries = MAX_RETRIES) {
  return new Promise((resolve, reject) => {
    const encodedText = encodeURIComponent(text);
    const options = {
      hostname: 'api.mymemory.translated.net',
      path: `/get?q=${encodedText}&langpair=en|ar`,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js Translation Script'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.responseData && result.responseData.translatedText) {
            resolve(result.responseData.translatedText);
          } else {
            throw new Error('Invalid translation response');
          }
        } catch (error) {
          if (retries > 0) {
            setTimeout(() => {
              resolve(translateWithRetry(text, retries - 1));
            }, TRANSLATION_DELAY);
          } else {
            console.error(`Failed to translate "${text}" after ${MAX_RETRIES} attempts`);
            resolve(text); // Return original text if translation fails
          }
        }
      });
    });

    req.on('error', (error) => {
      if (retries > 0) {
        setTimeout(() => {
          resolve(translateWithRetry(text, retries - 1));
        }, TRANSLATION_DELAY);
      } else {
        console.error(`Network error for "${text}":`, error.message);
        resolve(text);
      }
    });

    req.end();
  });
}

// Main function
async function main() {
  console.log('🚀 Starting translation key extraction and static text replacement...');
  console.log('📝 Processing <template> sections and <script> sections (title/label fields) in Vue files');

  const startTime = Date.now();
  
  // 1. Scan files and process static text
  const scanResults = await scanAndProcessDirectory(PROJECT_ROOT);
  
  // 2. Generate output statistics
  const output = {
    totalFilesScanned: scanResults.length,
    totalExistingKeys: scanResults.reduce((sum, file) => sum + file.existingKeys.length, 0),
    totalNewKeys: scanResults.reduce((sum, file) => sum + file.newKeys.length, 0),
    files: scanResults
  };

  // 3. Save scan results
  await writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`📊 Found ${output.totalExistingKeys} existing keys and added ${output.totalNewKeys} new keys in ${output.totalFilesScanned} files.`);

  // 4. Group keys by prefix
  const groupedKeys = await groupKeysByPrefix(scanResults);
  console.log(`🔑 Grouped into ${groupedKeys.length} translation groups.`);

  // 5. Skip Arabic translation and keep values same as keys
  await translateArabicValues(groupedKeys);

  // 6. Generate final structure
  const translations = await generateTranslations(groupedKeys);

  // 7. Save translations
  await writeFile(TRANSLATIONS_FILE, JSON.stringify(translations, null, 2));
  console.log(`✅ Saved translations to ${TRANSLATIONS_FILE}`);

  // 8. Print summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✨ Completed in ${duration} seconds`);
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});