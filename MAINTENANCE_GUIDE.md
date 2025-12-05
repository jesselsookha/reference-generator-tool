# Maintenance Guide

Quick reference for making changes to the Reference List Generator

## 📝 What to Edit Where

### Adding/Modifying Reference Types
**File**: `script.js`
**Location**: `formTemplates` object (starts around line 10)

Add new reference types by adding entries to the `formTemplates` object. Each type needs:
- `title`: Display name
- `info`: Brief description
- `fields`: Array of form fields
- `format`: Function that returns formatted reference string

### Changing Colors
**File**: `styles.css`
**Location**: `:root` section (lines 1-7)

```css
:root {
    --primary: #344164;
    --secondary: #F4DEC7;
    --accent: #F8C74E;
    --alert: #E93F3F;
    --muted: #5F6B53;
}
```

### Changing Fonts
**File**: `index.html` (Google Fonts link) + `styles.css` (font-family declarations)

1. Update Google Fonts import in `<head>` of `index.html`
2. Update font-family in `styles.css`:
   - Headings: Search for `font-family: 'Playfair Display'`
   - Body: Search for `font-family: 'Fira Sans'`

### Modifying Layout/Spacing
**File**: `styles.css`

- **Sidebar width**: `.main-layout` grid-template-columns
- **Container max-width**: `.container` max-width
- **Padding/margins**: Various sections
- **Responsive breakpoints**: Media queries at bottom of file

### Changing Storage Duration (currently 30 days)
**File**: `script.js`
**Location**: `loadReferences()` function

```javascript
const thirtyDays = 30 * 24 * 60 * 60 * 1000; // Change 30 to desired days
```

### Modifying File Download Name Format
**File**: `script.js`
**Location**: `downloadTxtFile()` function

```javascript
const filename = `ReferenceList_${timestamp}.txt`; // Change prefix here
```

### Updating Help Text/Tooltips
**File**: `script.js`
**Location**: In each reference type's `fields` array

```javascript
{ 
    name: 'field_name',
    hint: 'Change this example text',
    tooltip: 'Change this help text'
}
```

### Adding New Form Field Types
**File**: `script.js`
**Location**: `renderForm()` function

Currently supports:
- `text` (default)
- `select` (dropdown)
- `textarea` (multi-line)

Add new types by extending the conditional logic in `renderForm()`.

### Changing Modal/Popup Behavior
**File**: `styles.css` (styling) + `script.js` (functionality)

- Modal styles: Search for `.modal` in `styles.css`
- Modal functionality: `editReference()` function in `script.js`

## 🔧 Common Tasks

### Task: Add a new reference type
1. Open `script.js`
2. Find `formTemplates` object
3. Add new entry following existing pattern
4. Test thoroughly

### Task: Change the color scheme
1. Open `styles.css`
2. Modify `:root` CSS variables
3. Optional: Search for any hardcoded colors
4. Test in light/dark backgrounds

### Task: Modify form validation
1. Open `script.js`
2. Find `addReference()` function
3. Modify `processedData` logic
4. Test with various inputs

### Task: Change storage key name
1. Open `script.js`
2. Search for `'iie_references'` (2 occurrences)
3. Replace with new key name
4. Note: This will reset all stored references

### Task: Add a new output format (e.g., CSV export)
1. Open `script.js`
2. Add new function similar to `downloadTxtFile()`
3. Add button in `index.html` in output-actions section
4. Add event listener in initialization

### Task: Customize responsive breakpoints
1. Open `styles.css`
2. Scroll to bottom for `@media` queries
3. Modify pixel values (currently 1024px and 768px)

## 🐛 Debugging Tips

### References not saving
- Check browser console for localStorage errors
- Verify `saveReferences()` is being called
- Check if localStorage is enabled in browser

### Form not appearing
- Check `renderForm()` function
- Verify reference type exists in `formTemplates`
- Check browser console for JavaScript errors

### Copy function not working
- Check `copyAllReferences()` function
- Test in different browsers (some have restrictions)
- Verify references array has data

### Styling issues
- Check for CSS specificity conflicts
- Verify class names match between HTML and CSS
- Use browser DevTools to inspect elements

## 📦 File Overview

| File | Purpose | Edit Frequency |
|------|---------|----------------|
| `index.html` | Structure & markup | Rarely |
| `styles.css` | All visual styling | Occasional |
| `script.js` | All functionality | Frequent |
| `README.md` | Documentation | When features change |

## 🔄 Update Checklist

When making changes:

- [ ] Test on desktop
- [ ] Test on mobile
- [ ] Test in multiple browsers (Chrome, Firefox, Safari)
- [ ] Clear localStorage and test fresh start
- [ ] Test with existing saved references
- [ ] Update README.md if user-facing changes
- [ ] Update Changelog in README.md
- [ ] Commit with clear message

## 💡 Best Practices

1. **Always test thoroughly** after changes
2. **Backup script.js** before major modifications
3. **Use browser DevTools** to debug CSS/JS
4. **Keep formTemplates organized** alphabetically or by category
5. **Comment complex logic** for future reference
6. **Validate HTML/CSS** using online validators
7. **Test storage functions** with edge cases

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Review this maintenance guide
3. Check README.md for feature documentation
4. Create detailed issue report with:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)
