const fs = require('fs');
const path = require('path');

// Define the folder containing the files and the output file
const sourceFolder = './src/models'; // Replace with your folder path
const outputFile = './db_diagram.txt'; // Replace with your desired output file path

// Function to clear the output file
const clearOutputFile = () => {
  try {
    // Open the file in write mode to clear its content
    fs.writeFileSync(outputFile, '', { flag: 'w' });
    console.log(`Output file ${outputFile} has been cleared.`);
  } catch (error) {
    console.error('Error while clearing the output file:', error);
    throw error;
  }
};

// Function to merge files
const mergeFiles = async () => {
  try {
    // Clear the output file before starting
    clearOutputFile();

    // Read all files from the source folder
    const files = fs.readdirSync(sourceFolder);

    // Open the output file for writing
    const writeStream = fs.createWriteStream(outputFile, { flags: 'w' });

    for (const file of files) {
      const filePath = path.join(sourceFolder, file);

      // Ensure the item is a file
      if (fs.statSync(filePath).isFile()) {
        // Read the file line-by-line and write to the output file
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        writeStream.write(`--- Start of ${file} ---\n`); // Header for each file
        writeStream.write(fileContent + '\n'); // File content
        writeStream.write(`--- End of ${file} ---\n\n`); // Footer for each file
      }
    }

    // Close the write stream
    writeStream.end();

    console.log(`All files have been merged into ${outputFile}`);
  } catch (error) {
    console.error('Error while merging files:', error);
  }
};

// Run the merge function
mergeFiles();
