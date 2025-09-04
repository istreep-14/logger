// Google Apps Script Code for Text Logger
// This code goes in your Google Apps Script project

// Configuration - Change these values as needed
const SHEET_NAME = 'Text Logs'; // Name of the sheet tab
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your actual spreadsheet ID

/**
 * Serves the HTML web app
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Adds a text entry with timestamp to the Google Sheet
 * @param {string} text - The text to log
 * @return {Object} - Success/error response
 */
function addTextEntry(text) {
  try {
    // Input validation
    if (!text || text.trim() === '') {
      throw new Error('Text cannot be empty');
    }
    
    // Get or create the spreadsheet
    const spreadsheet = getOrCreateSpreadsheet();
    const sheet = getOrCreateSheet(spreadsheet, SHEET_NAME);
    
    // Prepare data
    const timestamp = new Date();
    const rowData = [
      timestamp,
      text.trim(),
      Session.getActiveUser().getEmail() // Optional: log who submitted
    ];
    
    // Add header row if this is the first entry
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 3).setValues([['Timestamp', 'Text', 'User']]);
      sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    // Add the data
    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, 3).setValues([rowData]);
    
    // Format the timestamp column
    sheet.getRange(nextRow, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    
    // Auto-resize columns for better visibility
    sheet.autoResizeColumns(1, 3);
    
    return {
      success: true,
      message: 'Text logged successfully',
      timestamp: timestamp.toLocaleString(),
      rowNumber: nextRow
    };
    
  } catch (error) {
    console.error('Error in addTextEntry:', error);
    return {
      success: false,
      message: 'Failed to log text: ' + error.message
    };
  }
}

/**
 * Gets existing spreadsheet or creates new one if SPREADSHEET_ID is not set
 * @return {Spreadsheet} - The Google Spreadsheet object
 */
function getOrCreateSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID !== 'YOUR_SPREADSHEET_ID_HERE') {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (error) {
      console.error('Could not open spreadsheet with ID:', SPREADSHEET_ID);
      throw new Error('Spreadsheet not found. Please check your SPREADSHEET_ID.');
    }
  } else {
    // Create a new spreadsheet if no ID is provided
    const spreadsheet = SpreadsheetApp.create('Text Logger Data');
    console.log('Created new spreadsheet:', spreadsheet.getId());
    console.log('Spreadsheet URL:', spreadsheet.getUrl());
    return spreadsheet;
  }
}

/**
 * Gets existing sheet or creates new one
 * @param {Spreadsheet} spreadsheet - The spreadsheet object
 * @param {string} sheetName - Name of the sheet
 * @return {Sheet} - The Google Sheet object
 */
function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    console.log('Created new sheet:', sheetName);
  }
  
  return sheet;
}

/**
 * Test function to verify everything is working
 */
function testAddEntry() {
  const result = addTextEntry('Test message from Apps Script');
  console.log('Test result:', result);
}

/**
 * Get the current spreadsheet information
 * @return {Object} - Spreadsheet details
 */
function getSpreadsheetInfo() {
  try {
    const spreadsheet = getOrCreateSpreadsheet();
    return {
      id: spreadsheet.getId(),
      url: spreadsheet.getUrl(),
      name: spreadsheet.getName()
    };
  } catch (error) {
    console.error('Error getting spreadsheet info:', error);
    return { error: error.message };
  }
}

/**
 * Setup function to run once to initialize everything
 */
function setupTextLogger() {
  console.log('Setting up Text Logger...');
  
  // Create/verify spreadsheet
  const spreadsheet = getOrCreateSpreadsheet();
  console.log('Spreadsheet ready:', spreadsheet.getName());
  console.log('Spreadsheet ID:', spreadsheet.getId());
  console.log('Spreadsheet URL:', spreadsheet.getUrl());
  
  // Create/verify sheet
  const sheet = getOrCreateSheet(spreadsheet, SHEET_NAME);
  console.log('Sheet ready:', sheet.getName());
  
  // Test adding an entry
  const testResult = addTextEntry('Setup test message - ' + new Date().toLocaleString());
  console.log('Test result:', testResult);
  
  console.log('Setup complete!');
}
