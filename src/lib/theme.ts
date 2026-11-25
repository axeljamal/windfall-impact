export const THEME_KEY = 'windfall-impact-theme';

/** Runs before paint so a saved day or night choice doesn't flash the wrong scheme. */
export const themeScript = `try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;
