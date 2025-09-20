# Fonts Directory

Place your font files here:

- `nordiquepro-semibold.otf` - Nordique Pro Semibold font file
- Convert to `.woff2` format for better web performance (optional)

## Font Conversion (Optional)

To convert OTF to WOFF2 for better performance:

1. Use online converters like:
   - https://convertio.co/otf-woff2/
   - https://cloudconvert.com/otf-to-woff2

2. Or use command line tools:
   ```bash
   # Install fonttools
   pip install fonttools[woff]
   
   # Convert OTF to WOFF2
   pyftsubset nordiquepro-semibold.otf --output-file=nordiquepro-semibold.woff2 --flavor=woff2
   ```

## File Structure
```
public/fonts/
├── nordiquepro-semibold.otf
└── nordiquepro-semibold.woff2 (optional, recommended)
```
