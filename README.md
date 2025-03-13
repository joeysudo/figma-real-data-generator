# Real Data Generator - Figma Plugin

A Figma plugin that helps designers populate their designs with realistic data. This plugin makes it easy to generate various types of real-life data such as names, emails, phone numbers, addresses, and more.

## Features

- **Single Data Generation**: Generate individual data items for selected text layers
- **Bulk Data Generation**: Generate multiple data items at once
- **AI-Generated Content**: Use Gemini AI to generate custom content based on your descriptions
- **Custom Data Input**: Paste your own data to use in your designs
- **Multiple Data Types**:
  - Names
  - Email addresses
  - Phone numbers
  - Physical addresses
  - Company names
  - Dates
  - Random numbers
  - Paragraphs of text

## How to Use

### Installation

1. In Figma, go to **Plugins > Browse plugins in Community**
2. Search for "Real Data Generator"
3. Click "Install"

### Single Data Generation

1. Select one or more text layers in your Figma design
2. Open the plugin (Plugins > Real Data Generator > Generate Data)
3. Choose the type of data you want to generate
4. Click "Generate Data"
5. The selected text layers will be populated with the generated data

### Bulk Data Generation

1. Select multiple text layers in your Figma design
2. Open the plugin
3. Click on the "Bulk Data" tab
4. Choose a data type or enter your own custom data (one item per line)
5. Click "Generate Bulk Data"
6. Each selected text layer will be populated with a different data item

### AI-Generated Content

1. Select one or more text layers in your Figma design
2. Open the plugin
3. Click on the "AI Generated" tab
4. Enter your Gemini API key (you can choose to save it in your browser for future use)
5. Describe what content you need (e.g., "Generate 5 product names for a luxury watch brand")
6. Optionally, describe the format or structure you want (e.g., "Each name should be on a new line and include a short tagline")
7. Set the number of items to generate
8. Click "Generate with AI"
9. Review the generated content and click "Apply to Selected Layers" to populate your text layers

### Custom Options

- **Numbers**: Set minimum and maximum values
- **Paragraphs**: Choose the number of sentences

## Development

This plugin is built using the Figma Plugin API and vanilla JavaScript.

### Project Structure

- `manifest.json`: Plugin configuration
- `code.js`: Main plugin code that interacts with the Figma API
- `ui.html`: User interface with embedded CSS and JavaScript

### API Configuration

To use the AI-generated content feature, you need to:

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/)
2. Enter your API key in the plugin interface when prompted
3. Optionally check "Save API key in browser storage" to avoid entering it each time

### Building from Source

1. Clone this repository
2. Make your changes
3. To test in Figma:
   - Go to Plugins > Development > Import plugin from manifest
   - Select the manifest.json file from this project

## License

MIT License

## Credits

Created by [Your Name]

---

If you have any suggestions or encounter any issues, please submit them on the GitHub repository or contact the author. 