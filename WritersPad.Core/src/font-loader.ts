export function loadGoogleFonts(fonts: string[]) {
    if (!fonts || fonts.length === 0) return;

    const families = fonts.map(font => font.replace(/ /g, '+')).join('|');
    const href = `https://fonts.googleapis.com/css?family=${families}&display=swap`;

    if (!document.querySelector(`link[href^="${href}"]`)) {
        const link = document.createElement('link');
        link.href = href;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }
}
