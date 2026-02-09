import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LEGAL_DIR = __dirname;
const PUBLIC_BASE_DIR = path.join(__dirname, '..', 'ui', 'public');

// Documents to process
const DOCUMENTS = [
  {
    name: 'terms',
    sourceFile: path.join(LEGAL_DIR, 'terms.md'),
    outputDir: path.join(PUBLIC_BASE_DIR, 'terms'),
    title: 'Terms of Service',
    packageField: 'latestTerms',
    packageDateField: 'latestTermsDate'
  },
  {
    name: 'privacy',
    sourceFile: path.join(LEGAL_DIR, 'privacy.md'),
    outputDir: path.join(PUBLIC_BASE_DIR, 'privacy'),
    title: 'Privacy Policy',
    packageField: 'latestPrivacy',
    packageDateField: 'latestPrivacyDate'
  }
];

/**
 * Compute a short hash of file content
 */
function computeHash(content) {
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  return hash.substring(0, 7);
}

/**
 * Parse the "Last Updated:" date from document content
 * Format: "Last Updated: YYYY-MM-DD" or "Last updated: YYYY-MM-DD"
 * Returns the date string or null if not found
 */
function parseLastUpdatedDate(content, docName) {
  // Match "Last Updated: YYYY-MM-DD" (case insensitive)
  const match = content.match(/Last [Uu]pdated:\s*(\d{4}-\d{2}-\d{2})/);

  if (!match) {
    throw new Error(
      `❌ No "Last Updated: YYYY-MM-DD" date found in ${docName}.md\n` +
      `   Please add a date in the format: "Last Updated: YYYY-MM-DD" or "Last updated: YYYY-MM-DD"`
    );
  }

  const date = match[1];
  console.log(`  Using document date: ${date}`);
  return date;
}

/**
 * Generate HTML from markdown content
 */
function generateHTML(markdownContent, title, filename) {
  const htmlContent = marked.parse(markdownContent);
  const mdFilename = filename.replace('.html', '.md');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - SpriteDX</title>
  <style>
    body {
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <p><a href="./${mdFilename}">View Markdown Source</a></p>
  <hr>
${htmlContent}
</body>
</html>
`;
}

/**
 * Process a document
 */
function processDocument(doc) {
  console.log(`Processing ${doc.name}.md...`);

  // Ensure output directory exists
  if (!fs.existsSync(doc.outputDir)) {
    fs.mkdirSync(doc.outputDir, { recursive: true });
  }

  // Check if source file exists
  if (!fs.existsSync(doc.sourceFile)) {
    console.log(`⚠️  ${doc.name}.md not found, skipping...`);
    return null;
  }

  // Read the file
  const content = fs.readFileSync(doc.sourceFile, 'utf-8');

  // Parse the date from the document
  const date = parseLastUpdatedDate(content, doc.name);

  // Compute hash and create filename
  const hash = computeHash(content);

  // Check if a file with this hash already exists (regardless of date)
  const existingFiles = fs.readdirSync(doc.outputDir)
    .filter(f => f.includes(hash) && f.endsWith('.md'));

  if (existingFiles.length > 0) {
    const existingFile = existingFiles[0];
    const existingBase = existingFile.replace('.md', '');
    const existingMd = existingFile;
    const existingHtml = existingFile.replace('.md', '.html');
    console.log(`  Version with hash ${hash} already exists (${existingBase}). No changes needed.`);
    return { mdFilename: existingMd, htmlFilename: existingHtml, isNew: false, doc, date };
  }
  const baseFilename = `${date}-${hash}`;
  const mdFilename = `${baseFilename}.md`;
  const htmlFilename = `${baseFilename}.html`;
  const mdOutputPath = path.join(doc.outputDir, mdFilename);
  const htmlOutputPath = path.join(doc.outputDir, htmlFilename);

  // Write the versioned markdown file
  fs.writeFileSync(mdOutputPath, content, 'utf-8');
  console.log(`  ✓ Created ${mdFilename}`);

  // Generate and write HTML file
  const html = generateHTML(content, doc.title, htmlFilename);
  fs.writeFileSync(htmlOutputPath, html, 'utf-8');
  console.log(`  ✓ Created ${htmlFilename}`);

  return { mdFilename, htmlFilename, isNew: true, doc, date };
}

/**
 * Update the index files with all versions for a document
 */
function updateIndex(doc) {
  console.log(`  Updating ${doc.name} index files...`);

  // Get all .md files in the output directory except index.md
  const files = fs.readdirSync(doc.outputDir)
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .sort()
    .reverse(); // Most recent first

  // Build index markdown content
  let indexMarkdown = `# ${doc.title}\n\n`;
  indexMarkdown += `## Current Version\n\n`;

  if (files.length === 0) {
    indexMarkdown += '*No versions available yet.*\n';
  } else {
    // Latest version
    const latestFile = files[0];
    const latestHtml = latestFile.replace('.md', '.html');
    const latestDate = latestFile.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || 'Unknown date';

    indexMarkdown += `This is the current active version of our ${doc.title}. By using our service, you agree to this version.\n\n`;
    indexMarkdown += `**Effective Date:** ${latestDate}\n\n`;
    indexMarkdown += `[View Current ${doc.title}](./${latestHtml})\n\n`;

    // Previous versions (if any)
    if (files.length > 1) {
      indexMarkdown += '---\n\n';
      indexMarkdown += '## Previous Versions\n\n';
      indexMarkdown += 'These are historical versions provided for reference only. They are no longer active.\n\n';
      files.slice(1).forEach(file => {
        const htmlFile = file.replace('.md', '.html');
        const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : 'Unknown date';
        indexMarkdown += `- [${date}](./${htmlFile})\n`;
      });
    }
  }

  indexMarkdown += '\n---\n\n';
  indexMarkdown += `*Page last updated: ${new Date().toISOString()}*\n`;

  // Write index.md
  const indexMdPath = path.join(doc.outputDir, 'index.md');
  fs.writeFileSync(indexMdPath, indexMarkdown, 'utf-8');
  console.log(`  ✓ Updated ${doc.name} index.md`);

  // Generate and write index.html
  const indexHtml = generateHTML(indexMarkdown, doc.title, 'index.html');
  const indexHtmlPath = path.join(doc.outputDir, 'index.html');
  fs.writeFileSync(indexHtmlPath, indexHtml, 'utf-8');
  console.log(`  ✓ Updated ${doc.name} index.html`);
}

/**
 * Update JSON index with all versions for a document
 */
function updateJsonIndex(doc) {
  console.log(`  Updating ${doc.name} index.json...`);

  // Get all .md files in the output directory except index.md
  const files = fs.readdirSync(doc.outputDir)
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .sort()
    .reverse(); // Most recent first

  // Build versions array
  const versions = files.map(file => {
    const htmlFile = file.replace('.md', '.html');
    const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
    const hashMatch = file.match(/-([a-f0-9]{7})\.md$/);

    return {
      date: dateMatch ? dateMatch[1] : null,
      hash: hashMatch ? hashMatch[1] : null,
      mdPath: `/${doc.name}/${file}`,
      htmlPath: `/${doc.name}/${htmlFile}`
    };
  });

  // Build index JSON structure
  const indexData = {
    documentType: doc.name,
    title: doc.title,
    latest: versions.length > 0 ? versions[0] : null,
    versions: versions,
    generatedAt: new Date().toISOString()
  };

  // Write index.json
  const indexJsonPath = path.join(doc.outputDir, 'index.json');
  fs.writeFileSync(indexJsonPath, JSON.stringify(indexData, null, 2) + '\n', 'utf-8');
  console.log(`  ✓ Updated ${doc.name} index.json`);
}

/**
 * Update package.json with latest document links
 */
function updatePackageJson(results) {
  console.log('Updating package.json...');

  const packageJsonPath = path.join(LEGAL_DIR, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Update fields for each processed document
  results.forEach(result => {
    if (result) {
      packageJson[result.doc.packageField] = `/${result.doc.name}/${result.htmlFilename}`;
      packageJson[result.doc.packageDateField] = result.date;
    }
  });

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
  console.log('✓ Updated package.json');
}

// Main execution
try {
  console.log('=== Legal Document Build ===\n');

  const results = [];
  let hasNewVersions = false;

  // Process each document
  for (const doc of DOCUMENTS) {
    const result = processDocument(doc);
    if (result) {
      updateIndex(result.doc);
      updateJsonIndex(result.doc);
      results.push(result);
      if (result.isNew) {
        hasNewVersions = true;
      }
    }
    console.log(); // Empty line between documents
  }

  // Update package.json with all results
  if (results.length > 0) {
    updatePackageJson(results);
  }

  console.log('✓ Build complete!\n');

  // Show summary
  console.log('Latest versions:');
  results.forEach(result => {
    const status = result.isNew ? '(new)' : '(unchanged)';
    console.log(`  ${result.doc.name}: ${result.htmlFilename} ${status}`);
  });

  if (hasNewVersions) {
    console.log('\n⚠️  New versions created. Remember to commit the changes!');
  }
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
