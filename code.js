// This plugin generates realistic data for Figma designs
// It can populate text layers with names, addresses, phone numbers, etc.

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 320, height: 480 });

// Called when a menu option is selected
figma.on("run", ({ command }) => {
  if (command === "about") {
    figma.closePlugin("Real Data Generator v1.0.0 - A plugin to generate realistic data for your designs");
  }
});

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'cancel') {
    figma.closePlugin();
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