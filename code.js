// This plugin generates realistic data for Figma designs
// It can populate text layers with names, addresses, phone numbers, etc.

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 320, height: 600 });

// Gemini API configuration
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Handle plugin cleanup when closed
figma.on('close', () => {
  // Clean up any pending operations or listeners
  figma.ui.onmessage = () => {};
});

// Function to call Gemini API
async function callGeminiAPI(apiKey, prompt, format, count) {
  try {
    const fullPrompt = format 
      ? `${prompt}\n\n${count > 1 ? `Generate ${count} items.` : `Generate 1 item.`}\n\nFormat Template: ${format}\n\nCRITICAL INSTRUCTIONS:\n1. You MUST follow the EXACT format template provided above.\n2. DO NOT add ANY additional text, explanations, or content outside the template.\n3. DO NOT include any introductory or concluding text.\n4. ONLY replace placeholders like [NAME], [DESCRIPTION], etc. with generated content.\n5. Maintain ALL line breaks, spacing, and punctuation exactly as shown in the template.\n6. Each item must strictly follow the template format with no deviations.\n7. Your entire response must be ONLY the filled-in templates, nothing else.` 
      : `${prompt}\n\nGenerate ${count} items.`;
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: format ? 0.2 : 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });
    
    // Check if plugin is still running before proceeding
    if (!figma.editorType) {
      throw new Error('Plugin closed during API call');
    }
    
    const data = await response.json();
    
    if (data.error) {
      // Provide more specific error messages based on common error codes
      if (data.error.code === 400) {
        throw new Error('Invalid request. Please check your API key and try again.');
      } else if (data.error.code === 401) {
        throw new Error('API key is invalid or expired. Please check your API key.');
      } else if (data.error.code === 403) {
        throw new Error('Access denied. Your API key may not have permission to use this model.');
      } else if (data.error.code === 404) {
        throw new Error('The specified model was not found. Try using a different model.');
      } else if (data.error.code === 429) {
        throw new Error('Quota exceeded or rate limit reached. Please try again later.');
      } else {
        throw new Error(data.error.message || 'Error calling Gemini API');
      }
    }
    
    // Check if candidates array exists and has content
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No content was generated. Please try a different prompt.');
    }
    
    // Check if content and parts exist
    if (!data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
      throw new Error('Generated content is empty. Please try a different prompt.');
    }
    
    // Extract the generated text from the response
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // If a format was provided, ensure the response strictly follows it
    if (format) {
      // Clean up the response to remove any introductory or concluding text
      // that the AI might have added despite our instructions
      return cleanResponseToMatchFormat(generatedText, format, count);
    }
    
    return generatedText;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error;
  }
}

// Called when a menu option is selected
figma.on("run", ({ command }) => {
  if (command === "about") {
    figma.closePlugin("Real Data Generator v1.0.0 - A plugin to generate realistic data for your designs");
  }
});

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'cancel') {
    // Ensure proper cleanup before closing
    figma.ui.onmessage = () => {};
    setTimeout(() => figma.closePlugin(), 100);
    return;
  }
  
  // Handle API key storage
  if (msg.type === 'save-api-key') {
    try {
      await figma.clientStorage.setAsync('geminiApiKey', msg.apiKey);
    } catch (error) {
      console.error('Error saving API key:', error);
    }
    return;
  }
  
  if (msg.type === 'remove-api-key') {
    try {
      await figma.clientStorage.deleteAsync('geminiApiKey');
    } catch (error) {
      console.error('Error removing API key:', error);
    }
    return;
  }
  
  if (msg.type === 'get-api-key') {
    try {
      const apiKey = await figma.clientStorage.getAsync('geminiApiKey');
      figma.ui.postMessage({
        type: 'saved-api-key',
        apiKey: apiKey || ''
      });
    } catch (error) {
      console.error('Error getting API key:', error);
      figma.ui.postMessage({
        type: 'saved-api-key',
        apiKey: ''
      });
    }
    return;
  }
  
  if (msg.type === 'generate-data') {
    const { dataType, count } = msg;
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      figma.notify("Please select at least one text layer");
      return;
    }
    
    // Process each selected node
    for (const node of selection) {
      if (node.type === "TEXT") {
        await figma.loadFontAsync(node.fontName);
        
        switch (dataType) {
          case 'name':
            node.characters = generateName();
            break;
          case 'email':
            node.characters = generateEmail();
            break;
          case 'phone':
            node.characters = generatePhone();
            break;
          case 'address':
            node.characters = generateAddress();
            break;
          case 'company':
            node.characters = generateCompany();
            break;
          case 'date':
            node.characters = generateDate();
            break;
          case 'number':
            node.characters = generateNumber(msg.min, msg.max);
            break;
          case 'paragraph':
            node.characters = generateParagraph(msg.sentences);
            break;
          default:
            node.characters = "Sample data";
        }
      }
    }
    
    figma.notify(`Generated ${dataType} data for ${selection.length} layers`);
  }
  
  if (msg.type === 'bulk-generate') {
    const { dataType, count } = msg;
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      figma.notify("Please select text layers");
      return;
    }
    
    // If custom data items are provided, use them
    if (msg.dataItems) {
      let index = 0;
      for (const node of selection) {
        if (node.type === "TEXT") {
          await figma.loadFontAsync(node.fontName);
          
          if (index < msg.dataItems.length) {
            node.characters = msg.dataItems[index];
            index++;
          }
        }
      }
      
      figma.notify(`Applied custom data to ${Math.min(selection.length, msg.dataItems.length)} layers`);
      return;
    }
    
    // Otherwise generate data based on the type
    const dataItems = [];
    const itemCount = count || 10;
    
    // Generate the requested number of data items
    for (let i = 0; i < itemCount; i++) {
      switch (dataType) {
        case 'names':
          dataItems.push(generateName());
          break;
        case 'emails':
          dataItems.push(generateEmail());
          break;
        case 'phones':
          dataItems.push(generatePhone());
          break;
        case 'addresses':
          dataItems.push(generateAddress());
          break;
        case 'companies':
          dataItems.push(generateCompany());
          break;
        default:
          dataItems.push(`Item ${i+1}`);
      }
    }
    
    // Apply the generated data to the selected text layers
    let index = 0;
    for (const node of selection) {
      if (node.type === "TEXT") {
        await figma.loadFontAsync(node.fontName);
        
        if (index < dataItems.length) {
          node.characters = dataItems[index];
          index++;
        }
      }
    }
    
    figma.notify(`Applied ${dataType} data to ${Math.min(selection.length, dataItems.length)} layers`);
  }
  
  // Handle AI content generation
  if (msg.type === 'generate-ai-content') {
    const { apiKey, prompt, format, count, timeoutId } = msg;
    
    try {
      // Validate API key format
      if (!apiKey || apiKey.trim() === '') {
        throw new Error('Please enter a valid API key');
      }
      
      // Call Gemini API to generate content
      const generatedContent = await callGeminiAPI(apiKey, prompt, format, count);
      
      // Send the generated content back to the UI
      figma.ui.postMessage({
        type: 'ai-content-generated',
        content: generatedContent,
        timeoutId: timeoutId
      });
      
      figma.notify('AI content generated successfully!');
    } catch (error) {
      console.error('Error in generate-ai-content:', error);
      
      // Send error message back to the UI
      figma.ui.postMessage({
        type: 'ai-content-generated',
        content: `Error generating content: ${error.message}`,
        timeoutId: timeoutId
      });
      
      figma.notify('Error generating AI content. Please try again.', { error: true });
    }
  }
};

// Data generation functions
function generateName() {
  const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Susan", "Richard", "Jessica", "Joseph", "Sarah", "Thomas", "Karen", "Charles", "Nancy", "Emma", "Olivia", "Noah", "Liam", "Sophia", "Ava", "Jackson", "Aiden", "Lucas", "Mia"];
  const lastNames = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "King", "Wright"];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generateEmail() {
  const name = generateName().replace(' ', '.').toLowerCase();
  const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "company.com", "example.org", "business.net"];
  
  return `${name}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

function generatePhone() {
  const formats = [
    "###-###-####",
    "(###) ###-####",
    "+1 ### ### ####",
    "###.###.####"
  ];
  
  const format = formats[Math.floor(Math.random() * formats.length)];
  
  return format.replace(/#/g, () => Math.floor(Math.random() * 10).toString());
}

function generateAddress() {
  const streetNumbers = Math.floor(Math.random() * 9000) + 1000;
  const streetNames = ["Main", "Oak", "Pine", "Maple", "Cedar", "Elm", "Washington", "Park", "Lake", "Hill", "River", "View", "Forest", "Broadway", "Market", "Church", "Spring", "Highland", "Sunset", "Valley"];
  const streetTypes = ["St", "Ave", "Blvd", "Rd", "Ln", "Dr", "Way", "Pl", "Ct"];
  const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "San Francisco", "Charlotte", "Indianapolis", "Seattle", "Denver", "Boston"];
  const states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
  const zipCodes = Math.floor(Math.random() * 90000) + 10000;
  
  return `${streetNumbers} ${streetNames[Math.floor(Math.random() * streetNames.length)]} ${streetTypes[Math.floor(Math.random() * streetTypes.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}, ${states[Math.floor(Math.random() * states.length)]} ${zipCodes}`;
}

function generateCompany() {
  const adjectives = ["Global", "National", "International", "Dynamic", "Future", "Pacific", "Central", "Digital", "Innovative", "Strategic", "Advanced", "United", "Allied", "Premier", "Elite", "Superior", "Prime", "Apex", "Pinnacle", "Summit"];
  const nouns = ["Solutions", "Systems", "Technologies", "Industries", "Enterprises", "Communications", "Associates", "Partners", "Consulting", "Corporation", "Group", "Agency", "Studios", "Media", "Networks", "Dynamics", "Innovations", "Applications", "Services", "Resources"];
  
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
}

function generateDate() {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - Math.floor(Math.random() * 365 * 2)); // Random date within past 2 years
  
  return pastDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function generateNumber(min = 0, max = 1000) {
  min = parseInt(min) || 0;
  max = parseInt(max) || 1000;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

function generateParagraph(sentences = 3) {
  const sentenceCount = parseInt(sentences) || 3;
  const sentenceStarters = [
    "The quick brown fox", "A gentle breeze", "The tall building", "An interesting fact", 
    "Some people believe", "Research indicates", "Experts agree", "Studies show", 
    "The latest trend", "According to sources", "The data suggests", "Recent developments",
    "The company announced", "Industry leaders", "The market analysis", "Customer feedback"
  ];
  
  const sentenceMiddles = [
    "jumps over", "runs past", "considers", "evaluates", "demonstrates", "illustrates", 
    "highlights", "emphasizes", "focuses on", "centers around", "revolves around",
    "is based on", "depends on", "relies on", "builds upon", "stems from"
  ];
  
  const sentenceEndings = [
    "the lazy dog.", "the new paradigm.", "several key factors.", "important considerations.", 
    "significant outcomes.", "unexpected results.", "promising opportunities.", 
    "potential challenges.", "strategic advantages.", "competitive benefits.",
    "market positioning.", "customer satisfaction.", "business growth.", "future prospects.",
    "industry standards.", "quality metrics."
  ];
  
  let paragraph = "";
  
  for (let i = 0; i < sentenceCount; i++) {
    const starter = sentenceStarters[Math.floor(Math.random() * sentenceStarters.length)];
    const middle = sentenceMiddles[Math.floor(Math.random() * sentenceMiddles.length)];
    const ending = sentenceEndings[Math.floor(Math.random() * sentenceEndings.length)];
    
    paragraph += `${starter} ${middle} ${ending} `;
  }
  
  return paragraph.trim();
}

// Function to clean up the API response to ensure it strictly follows the format
function cleanResponseToMatchFormat(response, format, count) {
  // Split the response into lines
  const responseLines = response.split('\n');
  const formatLines = format.split('\n');
  
  // If we're generating multiple items, we need to identify where each item starts and ends
  if (count > 1) {
    // Look for patterns that match the beginning of the format template
    // This is a simplified approach - we're looking for the first line of the format
    // in each item of the response
    const firstFormatLine = formatLines[0].trim();
    
    // Find all occurrences of lines that match or start with the first line of the format
    const itemStartIndices = [];
    
    responseLines.forEach((line, index) => {
      // Check if this line matches or starts with the first line of the format
      // We use a relaxed matching to account for the AI replacing placeholders
      if (line.trim() && (
          line.includes(firstFormatLine) || 
          firstFormatLine.includes('[') && line.includes(firstFormatLine.split('[')[0])
      )) {
        itemStartIndices.push(index);
      }
    });
    
    // If we found potential item starts
    if (itemStartIndices.length > 0) {
      // Extract each item based on the identified start indices
      let cleanedResponse = '';
      
      for (let i = 0; i < itemStartIndices.length; i++) {
        const startIdx = itemStartIndices[i];
        const endIdx = (i < itemStartIndices.length - 1) ? 
                        itemStartIndices[i + 1] : 
                        responseLines.length;
        
        // Extract this item's lines
        const itemLines = responseLines.slice(startIdx, endIdx);
        
        // Add to the cleaned response
        cleanedResponse += itemLines.join('\n') + '\n\n';
      }
      
      return cleanedResponse.trim();
    }
  }
  
  // If we couldn't identify multiple items or only generating one item,
  // just return the response as is, but trim any leading/trailing lines
  // that don't seem to be part of the format
  return responseLines
    .filter(line => line.trim()) // Remove empty lines
    .join('\n');
}