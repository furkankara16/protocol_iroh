// ── UTILITY FUNCTIONS ──
// Pure, stateless helpers used across the app.

export function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

export function dateFromStr(s) {
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y, m-1, d);
}

export function formatDateLong(s) {
  const d = dateFromStr(s);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(s) {
  const d = dateFromStr(s);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
}

export function addDays(dateStr, n) {
  const d = dateFromStr(dateStr);
  d.setDate(d.getDate() + n);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

export function isFuture(dateStr) {
  return dateStr > todayStr();
}

export function escHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

export function debounce(fn, ms) {
  let t;
  return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
}

export function logoSVG(cls) {
  return `<div class="logo-mark ${cls || ''}"><svg viewBox="0 0 200 220" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M72 168 C28 148 8 95 30 52 C52 9 110-2 152 20 C194 42 198 100 168 145 C155 165 135 177 118 178" stroke-width="4.5" opacity=".75"/>
    <path d="M68 165 Q68 198 100 205 Q132 198 132 165" stroke-width="4"/>
    <path d="M64 165 L136 165" stroke-width="4"/>
    <path d="M88 158 C83 140 93 128 88 112 C83 96 93 84 88 68" stroke-width="3" opacity=".6"/>
    <path d="M112 158 C117 138 107 126 112 108 C117 90 107 78 112 60" stroke-width="3" opacity=".6"/>
  </svg></div>`;
}

export function getCurrentMonth(startDate) {
  const start = new Date(startDate + 'T00:00:00');
  const now = new Date();
  const diffMs = now - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.min(12, Math.max(1, Math.floor(diffDays / 30) + 1));
}

export function getReflectionThemes(days, startDate, todayDate) {
  const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','was','are','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','must','i','me','my','we','us','our','you','your','he','him','his','she','her','it','its','they','them','their','that','this','these','those','what','which','who','whom','when','where','why','how','not','no','nor','so','if','then','than','too','very','just','about','up','out','into','over','after','before','between','through','during','above','below','each','all','both','few','more','most','some','such','only','own','same','also','back','still','even','again','there','here','now','well','like','really','much','quite','thing','things','something','nothing','everything','always','never','often','sometimes','today','yesterday','tomorrow','don','didn','doesn','wasn','won','isn','aren','weren','couldn','shouldn','wouldn','haven','hasn','hadn','going','been','being','having','doing','got','get','getting','know','think','feel','felt','want','went','going','make','made','said','say','tell','told','let','see','saw','come','came','take','took','give','gave','keep','kept','find','found','put','seem','seemed','work','day','time','way','lot','bit','little','many','people','one','two','first','last','long','new','old','good','bad','right','left','big','small','try','tried','because','instead','respond','avoid','react','reacted','avoided','grateful','didn\'t','create','week','morning','evening']);
  const wordCounts = {};
  const cutoff = addDays(todayDate, -30);

  Object.keys(days).forEach(ds => {
    if (ds < cutoff || ds > todayDate || ds < startDate) return;
    const dayData = days[ds];
    const ref = dayData.eveningReflection || {};
    const checkins = dayData.emotionalCheckins || [];
    const wi = dayData.weeklyIntegration || {};
    const allText = [ref.reacted, ref.avoided, ref.grateful, wi.pattern, wi.learning, wi.carryForward, ...checkins.map(c => c.label)].filter(Boolean).join(' ');
    const words = allText.toLowerCase().replace(/[^a-z\s'-]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    words.forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1; });
  });

  return Object.entries(wordCounts)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));
}
