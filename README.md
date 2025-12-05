# Reference List Generator

A comprehensive web-based tool for generating academic references in Harvard-Anglia style (adapted format). This tool helps students create properly formatted reference lists for academic assignments and research papers.

## 📚 Features

- **40+ Reference Types**: Comprehensive coverage of academic sources including:
  - Books (single/multiple authors, editors, chapters)
  - Journal articles (print and online)
  - Websites and online content
  - Multimedia (films, TV, podcasts, music)
  - Social media (Instagram, Facebook, X/Twitter, TikTok)
  - Government publications and legal documents
  - Theses, dissertations, and conference proceedings
  - And many more...

- **Smart Formatting**: Automatic formatting with proper italics, punctuation, and structure
- **Validation**: Handles missing information with Latin abbreviations (s.a., s.l., s.n.)
- **Hints System**: Toggle-able hints and examples for first-time users
- **Edit Functionality**: Edit existing references before finalizing
- **Alphabetical Sorting**: Automatic alphabetical organization by author
- **Local Storage**: Saves references locally with 30-day auto-cleanup
- **Copy & Download**: Copy formatted references or download as timestamped .txt file
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Getting Started

### Prerequisites

No prerequisites required! This is a standalone HTML/CSS/JavaScript application that runs entirely in the browser.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/reference-list-generator.git
   ```

2. Navigate to the project directory:
   ```bash
   cd reference-list-generator
   ```

3. Open `index.html` in your web browser, or serve it using a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (with http-server)
   npx http-server
   ```

4. Access the tool at `http://localhost:8000`

### GitHub Pages Deployment

1. Push your code to a GitHub repository
2. Go to repository Settings > Pages
3. Under "Source", select the branch (usually `main`) and root folder
4. Click "Save"
5. Your tool will be available at `https://yourusername.github.io/reference-list-generator/`

## 📖 Usage

1. **Select Reference Type**: Choose from the sidebar menu (e.g., "Book (one author)", "Website", "Journal Article")
2. **Fill in the Form**: Complete the required fields (marked with *)
3. **Add Reference**: Click "Add Reference" to add to your list
4. **Edit if Needed**: Use the "Edit" button to modify any reference
5. **Copy or Download**: 
   - Click "Copy All References" to copy formatted list to clipboard
   - Click "Download as .txt" to save as a text file with timestamp
6. **Clear**: Use "Clear All" to start fresh

### Tips

- Toggle "Show Hints" off if you're familiar with the requirements
- Use [s.a.] for missing year, [s.l.] for missing place, [s.n.] for missing publisher
- References are automatically sorted alphabetically by author
- Your references are saved locally and will persist for 30 days

## 🎨 Customization

### Colour Scheme

The tool uses a vintage color palette defined in `styles.css`:

```css
--primary: #344164;    /* Dark blue */
--secondary: #F4DEC7;  /* Cream */
--accent: #F8C74E;     /* Gold */
--alert: #E93F3F;      /* Red */
--muted: #5F6B53;      /* Olive green */
```

### Typography

- **Headings**: Playfair Display (serif)
- **Body Text**: Fira Sans (sans-serif)

To customize fonts, edit the Google Fonts import in `index.html` and update font-family declarations in `styles.css`.

## 📁 Project Structure

```
reference-list-generator/
│
├── index.html          # Main HTML structure
├── styles.css          # All styling and responsive design
├── script.js           # Application logic and reference templates
└── README.md           # This file
```

## 🛠️ Technical Details

- **No Dependencies**: Pure HTML, CSS, and JavaScript
- **Storage**: Uses Web Storage API (localStorage) for persistence
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Responsive**: Mobile-first design approach

## 🔄 Data Persistence

- References are stored in browser localStorage
- Automatic cleanup after 30 days
- Data is stored with the key `iie_references`
- No server-side storage or data transmission

## 📋 Reference Type Coverage

### Books & Publications
- Book (one author, 2-3 authors, 4+ authors)
- Book (same author, multiple publications)
- Book (editor/s)
- Chapter from edited book
- eBook
- PDF documents

### Academic Sources
- Journal article (print)
- Journal article (online)
- Dissertation/Thesis
- Conference proceedings
- Module outlines/lecture notes

### Online Sources
- Website
- Blog article
- YouTube/TEDx videos
- Social media posts (Instagram, Facebook, X, TikTok)

### Multimedia
- Film/DVD/Video
- TV series/episodes
- Sound clips/music
- CD/Album
- Radio programmes
- Podcasts

### Other Sources
- Newspaper/magazine articles
- Photographs and artworks
- Online images
- Interviews
- Government publications
- Acts/Bills/White Papers
- Dictionary/Encyclopedia
- Board games and video games
- Mobile apps
- Code snippets
- Secondary references

## 🐛 Known Issues

- Rich text copying may not preserve italics in all applications (use .txt download as fallback)
- Some older browsers may not support all features

## 🤝 Contributing

This is an educational tool developed for academic purposes. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available for educational use. Please maintain attribution if you use or modify this tool.

## 🙏 Acknowledgments

- Based on the Harvard-Anglia Style Reference Guide
- Developed for student use in academic writing
- Inspired by the need for accessible, accurate referencing tools

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation in this README

---

## 📝 Changelog

### Version 2.0.0 (Current)
**Release Date**: 5 December 2025

#### Added
- **Complete Reference Type Coverage**: Added 40+ reference types covering all major academic sources
- **Edit Functionality**: Users can now edit existing references in the list
- **Improved Copy Function**: Fixed copy all references to properly copy the complete formatted list
- **Enhanced Typography**: Added Playfair Display font for headings, Fira Sans for body text
- **Comprehensive Tooltips**: Added helpful tooltips for fields requiring special handling
- **Better Form Organization**: Improved form field layout and grouping
- **Secondary Reference Support**: Added support for citing sources within sources

#### Enhanced
- **Sidebar Navigation**: Reference types now dynamically populated from templates
- **Form Validation**: Improved validation with smart handling of optional fields
- **Storage System**: References now store both formatted text and original data for editing
- **Mobile Experience**: Improved responsive design for smaller screens
- **File Naming**: Download files now include timestamp in format `ReferenceList_YYYY-MM-DD-HHMMSS.txt`

#### Fixed
- **Copy All References**: Now properly copies the complete reference list with formatting
- **Edit Mode**: Form now correctly populates when editing existing references
- **Storage Cleanup**: Implemented automatic 30-day cleanup to prevent localStorage bloat
- **Latin Abbreviations**: Proper handling of [s.a.], [s.l.], and [s.n.] for missing info

#### Technical
- **Separated Files**: Split single-file application into index.html, styles.css, and script.js for better maintainability
- **Modular Architecture**: Reference templates now organized in a clear, extensible structure
- **Improved Code Comments**: Added comprehensive comments for future maintenance

---

### Version 1.0.0
**Release Date**: 4 December 2025 - Initial Development

#### Initial Features
- Basic reference types (8 core types)
- Simple form-based input
- Local storage
- Copy and download functionality
- Hints toggle
- Alphabetical sorting

#### Core Reference Types (v1.0)
- Book (one author)
- Book (2-3 authors)
- Book (4+ authors)
- Journal article
- Journal article (online)
- Website
- Chapter from edited book
- eBook

---

## 🗺️ Roadmap

### Planned Features
- [ ] Import references from BibTeX
- [ ] Export to other citation formats (APA, MLA, Chicago)
- [ ] Duplicate detection
- [ ] Batch edit functionality
- [ ] Search/filter references
- [ ] Cloud sync option (optional)
- [ ] Print-friendly view
- [ ] In-text citation generator
- [ ] Dark mode

### Under Consideration
- Integration with reference management tools
- Browser extension version
- Collaborative features
- Multiple style guides support

---

## 📚 Documentation

### For Developers

#### Adding a New Reference Type

1. Open `script.js`
2. Add a new entry to the `formTemplates` object:

```javascript
'your-reference-type': {
    title: 'Display Title',
    info: 'Brief description',
    fields: [
        { 
            name: 'field_name', 
            label: 'Field Label', 
            required: true, 
            hint: 'Example value',
            tooltip: 'Additional help' // optional
        },
        // ... more fields
    ],
    format: (data) => {
        // Return formatted reference string
        return `${data.field_name}, formatted reference...`;
    }
}
```

3. The new type will automatically appear in the sidebar

#### Field Types
- `type: 'select'` - Dropdown with options array
- `type: 'textarea'` - Multi-line text input
- Default - Single-line text input

#### Format Function
- Returns HTML string with `<em>` for italics and `<sup>` for superscripts
- Use `&lt;` and `&gt;` for URLs to display < and > properly

---

**Last Updated**: December 2025
