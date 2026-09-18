const viewer = document.querySelector('#image-viewer');
const openImage = (src, caption) => {
  viewer.querySelector('img').src = src;
  viewer.querySelector('img').alt = caption;
  viewer.querySelector('#viewer-caption').textContent = caption;
  viewer.showModal();
};
document.addEventListener('click', event => {
  const zoom = event.target.closest('[data-zoom]');
  if (zoom) openImage(zoom.dataset.zoom, zoom.dataset.caption || zoom.textContent.trim());
});
viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });

for (const gallery of document.querySelectorAll('[data-gallery]')) {
  const track = gallery.querySelector('.gallery-track');
  const files = gallery.dataset.files?.split(',') || Array.from({ length:Number(gallery.dataset.count) }, (_, i) => `${gallery.dataset.prefix}-${String(i + Number(gallery.dataset.start || 1)).padStart(2, '0')}.jpg`);
  for (const [i, file] of files.entries()) {
    const src = gallery.dataset.base + file;
    const split = Number(gallery.dataset.split);
    const label = split ? (i < split ? gallery.dataset.labelBefore : gallery.dataset.labelAfter) : gallery.dataset.label;
    const number = split && i >= split ? i - split + 1 : i + 1;
    const caption = file === 'facelift.jpg' ? '改款造型延续了 FREE DNA 前脸的主要设计语言' : `${label} ${String(number).padStart(2, '0')}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-card';
    button.dataset.zoom = src;
    button.dataset.caption = caption;
    button.innerHTML = `<img src="${src}" alt="${caption}" loading="lazy"><span><strong>${caption}</strong> · 点击查看大图 ↗</span>`;
    track.append(button);
  }
  track.addEventListener('wheel', event => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const atStart = track.scrollLeft <= 0 && event.deltaY < 0;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1 && event.deltaY > 0;
    if (!atStart && !atEnd) { event.preventDefault(); track.scrollLeft += event.deltaY; }
  }, { passive:false });
  gallery.querySelectorAll('[data-move]').forEach(button => button.addEventListener('click', () => track.scrollBy({ left:Number(button.dataset.move) * track.clientWidth * .85, behavior:'smooth' })));
}

for (const cover of document.querySelectorAll('[data-cover]')) {
  const slides = [...cover.querySelectorAll('img')];
  let current = 0;
  const show = i => { current = (i + slides.length) % slides.length; slides.forEach((slide, n) => slide.hidden = n !== current); cover.querySelector('.cover-count').textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`; };
  cover.querySelectorAll('[data-move]').forEach(button => button.addEventListener('click', () => show(current + Number(button.dataset.move))));
  show(0);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => { if (!cover.matches(':hover')) show(current + 1); }, 6000);
}

const videos = [...document.querySelectorAll('.video-track video')];
if (videos.length) {
  const track = document.querySelector('.video-track');
  let wheelLocked = false;
  track.addEventListener('wheel', event => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const atStart = track.scrollLeft <= 0 && event.deltaY < 0;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1 && event.deltaY > 0;
    if (!atStart && !atEnd) {
      event.preventDefault();
      if (!wheelLocked) {
        wheelLocked = true;
        track.scrollBy({ left:Math.sign(event.deltaY) * (track.firstElementChild.getBoundingClientRect().width + 12), behavior:'smooth' });
        setTimeout(() => { wheelLocked = false; }, 450);
      }
    }
  }, { passive:false });
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting && !matchMedia('(prefers-reduced-motion: reduce)').matches) entry.target.play().catch(() => {});
      else entry.target.pause();
    }
  }, { threshold:.55 });
  videos.forEach(video => { video.loop = true; observer.observe(video); });
}
