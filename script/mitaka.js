const BASE_URL = 'https://api.mitaka.mom/anime';
async function apiFetch(endpoint) {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const res = await fetch(url);
    const result = await res.json();
    return (result.status === 'success' || result.ok) ? result : null;
  } catch (e) {
    return null;
  }
}
function formatEpisodeTitle(title) {
  let epTitle = title;
  const matchStandard = epTitle.match(/(Episode|Eps|OVA|OAD|Movie)\s?(\d+(\.\d+)?)/i);
  if (matchStandard) {
    const type = matchStandard[1].toLowerCase() === 'eps' ? 'Episode' : matchStandard[1];
    return type.charAt(0).toUpperCase() + type.slice(1) + ' ' + matchStandard[2];
  }
  const matchHiddenNumber = epTitle.match(/(\d+(\.\d+)?)\s*(?:\(End\))?\s*(?:Subtitle|Sub)/i);
  if (matchHiddenNumber) return "Episode " + matchHiddenNumber[1];
  const allNumbers = epTitle.match(/\b\d+(\.\d+)?\b/g);
  if (allNumbers && allNumbers.length > 0) return "Episode " + allNumbers[allNumbers.length - 1];
  const lower = epTitle.toLowerCase();
  if (lower.includes('ova')) return 'OVA';
  if (lower.includes('oad')) return 'OAD';
  if (lower.includes('movie')) return 'Movie';
  if (lower.includes('special') || lower.includes('spesial')) return 'Special';
  return epTitle;
}
function renderGenreBadges(genreList) {
  if (!genreList || !genreList.length) return '';
  return `<div class="flex flex-wrap gap-2 mt-4 mb-2">` + genreList.map(g => {
    const fallbackTitle = g.genreId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return `<a href="/genre/${g.genreId}/1" class="bg-card border border-white/10 hover:border-brand hover:bg-brand/20 text-[10px] px-3 py-1.5 rounded-full text-gray-300 transition-all active:scale-95 shadow-sm">${g.title?.trim() || fallbackTitle}</a>`;
  }).join('') + `</div>`;
}
function renderInfoGrid(anime) {
  return `
    <div class="grid grid-cols-3 gap-3 mt-6 bg-black/40 border border-white/5 p-4 rounded-2xl text-center text-xs backdrop-blur-md shadow-inner">
      <div class="flex flex-col items-center"><svg class="w-4 h-4 text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg><span class="font-bold text-white">${anime.status || '-'}</span></div>
      <div class="flex flex-col items-center border-x border-white/10"><svg class="w-4 h-4 text-yellow-500 mb-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg><span class="font-bold text-yellow-500">${anime.score || 'Unrated'}</span></div>
      <div class="flex flex-col items-center"><svg class="w-4 h-4 text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg><span class="font-bold text-white">${anime.type || '-'}</span></div>
    </div>
  `;
}
function renderInfoList(anime) {
  const studios = anime.studios ? anime.studios.split(',').map(s => `<span>${s.trim()}</span>`).join('') : '-';
  const producers = anime.producers ? anime.producers.split(',').map(p => `<span>${p.trim()}</span>`).join('') : '-';
  return `
    <div class="mt-4 bg-black/20 border border-white/5 p-4 rounded-2xl backdrop-blur-md shadow-inner text-[11px] flex flex-col gap-2.5">
      <div class="flex justify-between items-start border-b border-white/5 pb-2"><span class="text-gray-400 font-medium shrink-0 mr-4">Aired</span><span class="text-white font-semibold text-right">${anime.aired || '-'}</span></div>
      <div class="flex justify-between items-start border-b border-white/5 pb-2"><span class="text-gray-400 font-medium shrink-0 mr-4">Total Episode</span><span class="text-white font-semibold text-right">${anime.episodes || '-'}</span></div>
      <div class="flex justify-between items-start border-b border-white/5 pb-2"><span class="text-gray-400 font-medium shrink-0 mr-4">Studio</span><div class="text-white font-semibold text-right leading-snug flex flex-col gap-1">${studios}</div></div>
      <div class="flex justify-between items-start"><span class="text-gray-400 font-medium shrink-0 mr-4">Produser</span><div class="text-white font-semibold text-right leading-snug flex flex-col gap-1">${producers}</div></div>
    </div>
  `;
}
function renderDownloadLinks(qualities, isBatch = false) {
  if (!qualities || !qualities.length) return '';
  const titleText = isBatch ? "Link Download Batch" : "Link Download";
  return `
    <div class="relative z-10 mt-4 bg-black/20 p-4 rounded-2xl border border-white/5 shadow-inner">
      <h3 class="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2"><svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> ${titleText}</h3>
      <div class="flex flex-col gap-3">
        ${qualities.map(q => `
          <div class="bg-card/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors shadow-sm">
            <div class="flex justify-between items-center mb-4 border-b border-white/5 pb-2"><span class="font-bold text-xs text-white uppercase">${q.title.replace(/_/g, ' ')}</span><span class="text-[9px] text-brand font-bold bg-brand/10 px-2 py-0.5 rounded border border-brand/20">${q.size || '-'}</span></div>
            <div class="flex flex-wrap gap-2">
              ${q.urls ? q.urls.map(url => `<a rel="nofollow" href="${url.url}" target="_blank" class="bg-white/5 hover:bg-brand hover:text-white text-[10px] px-3 py-1.5 rounded-lg text-gray-400 transition-all border border-white/5 hover:border-brand active:scale-90 shadow-sm">${url.title}</a>`).join('') : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
function saveToHistory(animeId, title, poster, episodeId, epsTitle) {
  let history = JSON.parse(localStorage.getItem('mitaka_history') || '[]');
  history = history.filter(h => h.animeId !== animeId);
  history.unshift({ animeId, title, poster, episodeId, epsTitle });
  localStorage.setItem('mitaka_history', JSON.stringify(history.slice(0, 5)));
}
document.addEventListener('click', e => {
  const a = e.target.closest('a');
  if (a) {
    const href = a.getAttribute('href');
    if (href && href.startsWith('/') && !href.startsWith('//') && a.getAttribute('target') !== '_blank') {
      e.preventDefault();
      window.navigateTo(href);
    }
  }
});
window.navigateTo = function(url) {
  history.pushState(null, null, url);
  handleRouting();
};
window.showToast = function(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-brand';
  const icon = type === 'success' ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
  toast.className = `${bgColor} text-white px-4 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3 text-xs font-bold transform transition-all duration-300 -translate-y-20 opacity-0 z-[9999] pointer-events-auto border border-white/20`;
  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);
  void toast.offsetWidth;
  toast.classList.remove('-translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('-translate-y-20', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};
window.toggleBookmark = function(id, title, poster, score) {
  let bookmarks = JSON.parse(localStorage.getItem('mitaka_bookmarks') || '[]');
  const index = bookmarks.findIndex(b => b.animeId === id);
  const icon = document.getElementById('icon-bookmark');
  if (index > -1) {
    bookmarks.splice(index, 1);
    showToast('Dihapus dari bookmark!', 'error');
    if(icon) { icon.classList.replace('text-brand', 'text-gray-400'); icon.classList.add('group-hover:text-white'); icon.classList.remove('fill-brand'); icon.setAttribute('fill', 'none'); }
  } else {
    bookmarks.push({ animeId: id, title, poster, score });
    showToast('Disimpan ke bookmark!', 'success');
    if(icon) { icon.classList.remove('text-gray-400', 'group-hover:text-white'); icon.classList.add('text-brand', 'fill-brand'); icon.setAttribute('fill', 'currentColor'); }
  }
  localStorage.setItem('mitaka_bookmarks', JSON.stringify(bookmarks));
};
window.addEventListener('load', () => {
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    const logoContainer = document.getElementById('splash-logo-container');
    if (logoContainer) logoContainer.classList.replace('scale-100', 'scale-110');
    if (splash) {
      splash.style.opacity = '0';
      splash.style.visibility = 'hidden';
      setTimeout(() => splash.style.display = 'none', 700);
    }
  }, 1200);
});
let heroScrollInterval;
function updateCarouselDots() {
  const hero = document.getElementById('hero-section');
  if(!hero) return;
  const currentIndex = Math.round(hero.scrollLeft / hero.offsetWidth);
  const dots = document.getElementById('carousel-dots').children;
  for(let i = 0; i < dots.length; i++) {
    if(i === currentIndex) {
      dots[i].className = 'w-4 h-1.5 rounded-full bg-brand transition-all duration-300 shadow-[0_0_8px_rgba(225,29,72,0.8)]';
    } else {
      dots[i].className = 'w-1.5 h-1.5 rounded-full bg-white/30 hover:bg-white/60 transition-all duration-300 cursor-pointer';
    }
  }
}
function scrollToSlide(index) {
  const hero = document.getElementById('hero-section');
  if(hero) {
    hero.scrollTo({ left: index * hero.offsetWidth, behavior: 'smooth' });
    startHeroCarousel();
  }
}
function startHeroCarousel() {
  const hero = document.getElementById('hero-section');
  if(!hero) return;
  hero.removeEventListener('scroll', updateCarouselDots);
  hero.addEventListener('scroll', updateCarouselDots);
  clearInterval(heroScrollInterval);
  heroScrollInterval = setInterval(() => {
    if(hero.children.length > 1) {
      let nextScroll = hero.scrollLeft + hero.offsetWidth;
      if(nextScroll >= hero.scrollWidth - 10) nextScroll = 0;
      hero.scrollTo({ left: nextScroll, behavior: 'smooth' });
    }
  }, 3500);
}
const btnSearchMobile = document.getElementById('btn-search-mobile');
if(btnSearchMobile) {
  btnSearchMobile.addEventListener('click', () => {
    const bar = document.getElementById('mobile-search-bar');
    bar.classList.toggle('hidden');
    if(!bar.classList.contains('hidden')) document.getElementById('search-input-mobile').focus();
  });
}
const handleSearchSubmit = (e, inputId) => {
  e.preventDefault();
  const keyword = document.getElementById(inputId).value.trim();
  if (keyword) {
    document.getElementById('mobile-search-bar').classList.add('hidden');
    document.getElementById(inputId).value = '';
    window.navigateTo(`/search/${encodeURIComponent(keyword)}/1`);
  }
};
const searchFormEl = document.getElementById('search-form');
if(searchFormEl) searchFormEl.addEventListener('submit', (e) => handleSearchSubmit(e, 'search-input'));
const searchFormMobileEl = document.getElementById('search-form-mobile');
if(searchFormMobileEl) searchFormMobileEl.addEventListener('submit', (e) => handleSearchSubmit(e, 'search-input-mobile'));
function updateSEO(title, description, image = '') {
  document.title = title;
  const currentUrl = window.location.href;
  const setMeta = (name, content, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name';
    let meta = document.querySelector(`meta[${attr}="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attr, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };
  const setLink = (rel, href) => {
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', rel);
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  };
  setMeta('description', description);
  setMeta('og:type', 'website', true);
  setMeta('og:url', currentUrl, true);
  setMeta('og:title', title, true);
  setMeta('og:description', description, true);
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:url', currentUrl);
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
  if(image) {
    setMeta('og:image', image, true);
    setMeta('twitter:image', image);
  }
  setLink('canonical', currentUrl);
}
function renderPagination(pagination, hashBase) {
  if (!pagination) return '';
  let html = '<div class="flex justify-between items-center w-full">';
  if (pagination.hasPrevPage) {
    html += `<a href="${hashBase}/${pagination.prevPage}" class="bg-card hover:bg-white/10 text-white text-xs font-medium py-2 px-4 rounded-xl transition-all border border-white/5 shadow-md flex items-center gap-1 active:scale-95"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg> Previous</a>`;
  } else {
    html += `<button disabled class="bg-card/30 text-gray-600 text-xs font-medium py-2 px-4 rounded-xl cursor-not-allowed flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg> Previous</button>`;
  }
  html += `<span class="text-xs text-brand font-bold bg-brand/10 px-3 py-1.5 rounded-xl border border-brand/20 shadow-[0_0_10px_rgba(225,29,72,0.2)]">${pagination.currentPage} <span class="text-gray-500 font-medium">/ ${pagination.totalPages}</span></span>`;
  if (pagination.hasNextPage) {
    html += `<a href="${hashBase}/${pagination.nextPage}" class="bg-brand hover:bg-brand/80 text-white text-xs font-medium py-2 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] flex items-center gap-1 active:scale-95">Next <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a>`;
  } else {
    html += `<button disabled class="bg-card/30 text-gray-600 text-xs font-medium py-2 px-4 rounded-xl cursor-not-allowed flex items-center gap-1">Next <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>`;
  }
  html += '</div>';
  return html;
}
function handleRouting() {
  let path = window.location.pathname;
  if (!path || path === '/' || path === '/index.html') {
    history.replaceState(null, null, '/home');
    path = '/home';
  }
  const parts = path.split('/');
  const route = parts[1];
  let paramId = null;
  let pageNum = 1;
  if (['katalog', 'ongoing'].includes(route)) {
    pageNum = parts[2] || 1;
  } else if (['search', 'genre', 'anime', 'episode', 'batch'].includes(route)) {
    paramId = parts[2];
    pageNum = parts[3] || 1;
  }
  document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
  const btnBack = document.getElementById('btn-back');
  const headerTitle = document.getElementById('header-title');
  const searchForm = document.getElementById('search-form');
  const btnSearchMobile = document.getElementById('btn-search-mobile');
  const mobileSearchBar = document.getElementById('mobile-search-bar');
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.replace('text-brand', 'text-gray-500');
    const iconDiv = btn.querySelector('div');
    if(iconDiv) iconDiv.classList.remove('bg-brand/20', 'shadow-[0_0_10px_rgba(225,29,72,0.3)]');
  });
  const isTopLevel = ['home', 'jadwal', 'genre', 'katalog', 'bookmark'].includes(route) && !paramId;
  if (isTopLevel) {
    if(btnBack) btnBack.classList.add('hidden');
    if(searchForm) searchForm.classList.replace('hidden', '[@media(min-width:400px)]:flex');
    if(btnSearchMobile) btnSearchMobile.classList.remove('hidden');
    const navBtn = document.getElementById(`nav-${route}`);
    if(navBtn) {
      navBtn.classList.replace('text-gray-500', 'text-brand');
      const iconDiv = navBtn.querySelector('div');
      if(iconDiv) iconDiv.classList.add('bg-brand/20', 'shadow-[0_0_10px_rgba(225,29,72,0.3)]');
    }
  } else {
    if(btnBack) btnBack.classList.remove('hidden');
    if(searchForm) searchForm.classList.replace('[@media(min-width:400px)]:flex', 'hidden');
    if(btnSearchMobile) btnSearchMobile.classList.add('hidden');
    if(mobileSearchBar) mobileSearchBar.classList.add('hidden');
  }
  switch (route) {
    case 'home':
      document.getElementById('view-home').classList.add('active');
      headerTitle.innerHTML = 'mitaka<span class="text-white">nime</span>';
      updateSEO('Mitaka Anime - Home', 'Tonton dan download 19 juta anime ongoing maupun tamat ber-subtitle Indonesia gratis.');
      fetchHome();
      break;
    case 'jadwal':
      document.getElementById('view-jadwal').classList.add('active');
      headerTitle.innerHTML = 'mitaka<span class="text-white">nime</span>';
      updateSEO('Jadwal Rilis Anime', 'Cek jadwal tayang anime kesayanganmu di Mitaka.');
      fetchJadwal();
      break;
    case 'genre':
      if (paramId) {
        document.getElementById('view-list').classList.add('active');
        headerTitle.innerText = 'Genre';
        document.getElementById('list-title').innerHTML = `<svg class="w-5 h-5 text-brand inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg> Genre <span class="text-white capitalize">${paramId.replace('-', ' ')}</span>`;
        updateSEO(`Genre ${paramId} - Halaman ${pageNum}`, `Daftar anime genre ${paramId}.`);
        fetchList(`${BASE_URL}/genre/${paramId}?page=${pageNum}`, `/genre/${paramId}`);
      } else {
        document.getElementById('view-genre').classList.add('active');
        headerTitle.innerHTML = 'mitaka<span class="text-white">nime</span>';
        updateSEO('Daftar Genre Anime', 'Jelajahi berbagai genre anime yang ada di Mitaka.');
        fetchGenreList();
      }
      break;
    case 'katalog':
      document.getElementById('view-katalog').classList.add('active');
      headerTitle.innerHTML = 'mitaka<span class="text-white">nime</span>';
      updateSEO(`Daftar Anime - Halaman ${pageNum}`, 'Daftar lengkap anime tamat (completed).');
      fetchKatalog(pageNum);
      break;
    case 'bookmark':
      document.getElementById('view-bookmark').classList.add('active');
      headerTitle.innerHTML = 'mitaka<span class="text-white">nime</span>';
      updateSEO('Bookmark', 'Daftar anime yang kamu simpan.');
      fetchBookmarks();
      break;
    case 'ongoing':
      document.getElementById('view-list').classList.add('active');
      headerTitle.innerText = 'Home';
      document.getElementById('list-title').innerHTML = `<svg class="w-5 h-5 text-brand drop-shadow-[0_0_5px_rgba(225,29,72,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path></svg> Anime <span class="text-white capitalize">Ongoing</span>`;
      updateSEO(`Anime Sedang Tayang - Halaman ${pageNum}`, 'Daftar anime ongoing rilis setiap minggu.');
      fetchList(`${BASE_URL}/ongoing-anime?page=${pageNum}`, `/ongoing`);
      break;
    case 'search':
      if (paramId) {
        document.getElementById('view-list').classList.add('active');
        headerTitle.innerText = 'Pencarian';
        document.getElementById('list-title').innerHTML = `<svg class="w-5 h-5 text-brand drop-shadow-[0_0_5px_rgba(225,29,72,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path></svg> Hasil <span class="text-white capitalize">Pencarian</span>`;
        updateSEO(`Cari: ${decodeURIComponent(paramId)} - Halaman ${pageNum}`, 'Hasil pencarian anime.');
        fetchList(`${BASE_URL}/search/${paramId}?page=${pageNum}`, `/search/${paramId}`);
      }
      break;
    case 'anime':
      if (paramId) {
        document.getElementById('view-detail').classList.add('active');
        headerTitle.innerText = 'Detail';
        fetchDetail(paramId);
      }
      break;
    case 'episode':
      if (paramId) {
        document.getElementById('view-episode').classList.add('active');
        headerTitle.innerText = 'Nonton';
        fetchEpisode(paramId);
      }
      break;
    case 'batch':
      if (paramId) {
        document.getElementById('view-batch').classList.add('active');
        headerTitle.innerText = 'Download Batch';
        fetchBatch(paramId);
      }
      break;
    case 'az':
      document.getElementById('view-az').classList.add('active');
      headerTitle.innerText = 'Daftar A-Z';
      updateSEO('Direktori Anime A-Z - Mitaka Anime', 'Telusuri direktori lengkap ribuan anime berdasarkan abjad.');
      fetchAZ();
      break;
    case 'dmca':
      document.getElementById('view-dmca').classList.add('active');
      headerTitle.innerText = 'DMCA';
      updateSEO('DMCA - Mitaka Anime', 'Pemberitahuan hak cipta dan prosedur DMCA.');
      break;
    case 'terms':
      document.getElementById('view-terms').classList.add('active');
      headerTitle.innerText = 'Syarat & Ketentuan';
      updateSEO('Syarat & Ketentuan - Mitaka Anime', 'Syarat dan ketentuan penggunaan layanan.');
      break;
    default:
      window.navigateTo('/home');
      return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.addEventListener('popstate', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);
function renderSkeletonGrid(count) {
  let html = '';
  for(let i=0; i<count; i++) html += '<div class="bg-card/50 animate-pulse rounded-xl pb-[140%] border border-white/5"></div>';
  return html;
}
function createAnimeCard(anime, isCompleted = false) {
  const routeId = anime.animeId || anime.slug;
  let badge = '';
  if (isCompleted && anime.score) {
    badge = `<div class="absolute top-2 right-2 bg-yellow-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg z-20"><svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>${anime.score}</div>`;
  } else if (anime.releaseDay) {
    badge = `<div class="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-lg border border-white/10 shadow-lg z-20">${anime.releaseDay}</div>`;
  }
  const dateStr = isCompleted ? (anime.lastReleaseDate || '') : (anime.latestReleaseDate || '');
  const epsStr = anime.episodes ? `Eps ${anime.episodes}` : '';
  const infoRow = (epsStr || dateStr) ? `<div class="flex justify-between items-center mt-1"><span class="text-[10px] text-gray-400 bg-black/50 px-1.5 rounded">${epsStr}</span><span class="text-[10px] text-brand font-semibold">${dateStr}</span></div>` : '';
  return `
    <a href="/anime/${routeId}" class="group block relative rounded-xl overflow-hidden bg-card shadow-lg hover:-translate-y-1.5 hover:shadow-[0_15px_30px_rgba(225,29,72,0.3)] transition-all duration-300 border border-white/5 active:scale-95">
      <div class="relative pb-[140%] overflow-hidden">
        <img src="${anime.poster}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 group-hover:blur-[2px] transition-all duration-500" loading="lazy">
        ${badge}
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
          <svg class="w-12 h-12 text-white drop-shadow-[0_0_15px_rgba(225,29,72,1)] scale-50 group-hover:scale-100 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
        </div>
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-12 z-20">
          <h3 class="text-white text-xs font-semibold line-clamp-2 leading-snug mb-1 drop-shadow-md">${anime.title}</h3>
          ${infoRow}
        </div>
      </div>
    </a>
  `;
}
async function fetchHome() {
  const container = document.getElementById('home-container');
  const heroSection = document.getElementById('hero-section');
  if(container.children.length > 0 && !container.innerHTML.includes('animate-pulse')) return;
  container.innerHTML = renderSkeletonGrid(4);
  const result = await apiFetch('/home');
  if (result && result.data) {
    const heroAnimes = result.data.ongoing.animeList.slice(0, 4);
    const ongoingList = result.data.ongoing.animeList.slice(4, 10);
    heroSection.classList.remove('animate-pulse', 'bg-card/10');
    heroSection.innerHTML = heroAnimes.map((heroAnime, index) => `
      <div class="min-w-full flex-shrink-0 snap-center relative w-full h-full group overflow-hidden" style="height: 480px;">
        <div class="absolute inset-0 z-0" style="-webkit-mask-image: linear-gradient(to top, transparent 0%, black 70%); mask-image: linear-gradient(to top, transparent 0%, black 70%);">
          <img src="${heroAnime.poster}" class="absolute inset-0 w-full h-full object-cover" style="filter: blur(4px); transform: scale(1.2); opacity: 0.35;">
          <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(10,15,28,1) 0%, rgba(10,15,28,0.5) 40%, transparent 100%);"></div>
        </div>
        <div class="absolute inset-0 flex flex-col items-center justify-center pt-8 px-5 z-10" style="padding-bottom: 90px;">
          <div class="w-32 h-48 mb-4 shadow-[0_15px_35px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden transform group-hover:scale-105 transition-transform duration-500 relative shrink-0" style="border-radius: 12px;">
            <img src="${heroAnime.poster}" alt="${heroAnime.title}" class="w-full h-full object-cover">
          </div>
          <div class="flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-gray-300 mb-3 uppercase drop-shadow-md">
            <span class="text-brand">Top ${index + 1}</span>
            <span class="w-1 h-1 bg-gray-500 rounded-full"></span>
            <span>Sub Indo</span>
            <span class="w-1 h-1 bg-gray-500 rounded-full"></span>
            <span>HD</span>
          </div>
          <h2 class="text-2xl font-black text-white font-semibold text-center leading-tight mb-6 drop-shadow-lg line-clamp-2 px-2">${heroAnime.title}</h2>
          <div class="flex items-center justify-center gap-3 w-full max-w-[280px]">
            <a href="/anime/${heroAnime.animeId}" class="flex-1 bg-[#2b2b2b]/80 backdrop-blur-md text-white font-bold py-2 rounded-2xl text-xs hover:bg-[#3b3b3b]/80 transition-colors flex items-center justify-center gap-2 active:scale-95 border border-white/5 shadow-lg">
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg> Putar
            </a>
            <button onclick="toggleBookmark('${heroAnime.animeId}', '${heroAnime.title.replace(/'/g, "\\'")}', '${heroAnime.poster}', '')" class="flex-1 bg-[#2b2b2b]/80 backdrop-blur-md text-white font-bold py-2 rounded-2xl text-xs hover:bg-[#3b3b3b]/80 transition-colors flex items-center justify-center gap-2 active:scale-95 border border-white/5 shadow-lg">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> Simpan
            </button>
          </div>
        </div>
      </div>
    `).join('');
    const dotsContainer = document.getElementById('carousel-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = heroAnimes.map((_, index) => `
        <button aria-label="Slide ${index + 1}" onclick="scrollToSlide(${index})" class="${index === 0 ? 'w-4 h-1.5 bg-brand shadow-[0_0_8px_rgba(225,29,72,0.8)]' : 'w-1.5 h-1.5 bg-white/30'} rounded-full transition-all duration-300 cursor-pointer"></button>
      `).join('');
    }
    startHeroCarousel();
    const history = JSON.parse(localStorage.getItem('mitaka_history') || '[]');
    const historyContainer = document.getElementById('history-container');
    if (history.length > 0) {
      const last = history[0];
      historyContainer.innerHTML = `
        <a href="/episode/${last.episodeId}" class="mb-6 relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_10px_30px_rgba(225,29,72,0.15)] group block active:scale-[0.98] transition-transform">
          <img src="${last.poster}" class="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 group-hover:opacity-60 transition-opacity">
          <div class="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/80 to-transparent"></div>
          <div class="relative p-4 flex items-center gap-4">
            <div class="w-16 h-24 shrink-0 rounded-lg overflow-hidden shadow-lg border border-white/10 relative">
              <img src="${last.poster}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            </div>
            <div class="flex-1 min-w-0 py-1">
              <h3 class="text-[10px] font-bold text-brand uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <svg class="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/></svg>
                Lanjutkan Nonton
              </h3>
              <h4 class="text-white text-sm font-bold truncate mb-0.5 drop-shadow-md">${last.title}</h4>
              <p class="text-[10px] text-gray-400 mb-2 truncate">${last.epsTitle}</p>
              <span class="inline-flex items-center gap-1.5 bg-brand text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md group-hover:bg-brand/80 transition-colors">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
                Tonton
              </span>
            </div>
          </div>
        </a>
      `;
    } else {
      historyContainer.innerHTML = '';
    }
    container.innerHTML = ongoingList.map(a => createAnimeCard(a, false)).join('');
  } else {
    container.innerHTML = '<p class="text-red-500 text-sm col-span-2 text-center bg-red-500/10 p-4 rounded-xl border border-red-500/20">Gagal memuat data.</p>';
  }
}
async function fetchKatalog(page) {
  const container = document.getElementById('katalog-container');
  const paginationContainer = document.getElementById('katalog-pagination');
  container.innerHTML = renderSkeletonGrid(6);
  paginationContainer.innerHTML = '';
  const result = await apiFetch(`/complete-anime?page=${page}`);
  if (result && result.data && result.data.animeList) {
    container.innerHTML = result.data.animeList.map(a => createAnimeCard(a, true)).join('');
    paginationContainer.innerHTML = renderPagination(result.pagination, '/katalog');
  } else {
    container.innerHTML = '<p class="text-red-500 text-sm col-span-2 text-center">Gagal memuat data.</p>';
  }
}
async function fetchAZ() {
  const container = document.getElementById('az-container');
  const jumpContainer = document.getElementById('az-jump-links');
  if (container.children.length > 0 && !container.innerHTML.includes('animate-pulse')) return;
  container.innerHTML = Array(3).fill(`<div style="margin-bottom: 40px;"><div class="flex items-center justify-between border-y border-white/5 shadow-sm" style="background-color: rgba(10, 15, 28, 0.95); margin-bottom: 16px; margin-left: -20px; margin-right: -20px; padding: 12px 20px;"><div style="display: flex; align-items: center; gap: 16px;"><div class="animate-pulse" style="width: 38px; height: 38px; border-radius: 12px; background-color: rgba(225, 29, 72, 0.1); border: 1px solid rgba(225, 29, 72, 0.3);"></div><div class="animate-pulse bg-white/10 rounded" style="width: 48px; height: 10px;"></div></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${Array(4).fill(`<div class="relative bg-card/40 border border-white/5 flex items-center justify-between shadow-sm overflow-hidden" style="border-radius: 14px; padding: 10px 16px;"><div style="display: flex; align-items: center; flex: 1; min-width: 0; padding-right: 12px;"><div class="animate-pulse bg-white/10 rounded w-full" style="height: 14px;"></div></div><div class="animate-pulse bg-white/10 rounded" style="width: 16px; height: 16px; flex-shrink: 0;"></div></div>`).join('')}</div></div>`).join('');
  jumpContainer.innerHTML = '';
  const result = await apiFetch(`/unlimited`);
  if (result && result.data && result.data.list) {
    const groupedData = {};
    result.data.list.forEach(group => {
      let cleanLetter = group.startWith.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      cleanLetter = cleanLetter.charAt(0);
      if (!/^[A-Z0-9#]$/.test(cleanLetter)) {
        const firstTitle = group.animeList[0]?.title || "";
        let guessLetter = firstTitle.charAt(0).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        cleanLetter = /^[A-Z0-9]$/.test(guessLetter) ? guessLetter : '#';
      }
      if (!groupedData[cleanLetter]) groupedData[cleanLetter] = { startWith: cleanLetter, animeList: [] };
      groupedData[cleanLetter].animeList.push(...group.animeList);
    });
    const cleanList = Object.values(groupedData).sort((a, b) => {
      if (a.startWith === '#') return -1;
      if (b.startWith === '#') return 1;
      return a.startWith.localeCompare(b.startWith, 'id', { numeric: true });
    });
    jumpContainer.innerHTML = cleanList.map(group => `
      <button onclick="document.getElementById('az-group-${group.startWith === '#' ? 'simbol' : group.startWith}').scrollIntoView({behavior: 'smooth', block: 'start'})" class="group relative overflow-hidden transition-all duration-300 active:scale-90 flex items-center justify-center w-full aspect-square" style="border-radius: 12px; background-color: rgba(20, 26, 38, 0.8); border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style="background: radial-gradient(circle at top, rgba(225,29,72,0.25) 0%, transparent 70%); border: 1px solid rgba(225,29,72,0.5); border-radius: 12px; box-shadow: inset 0 0 15px rgba(225,29,72,0.15);"></div>
        <span class="relative z-10 group-hover:text-white transition-colors duration-300 drop-shadow-md" style="font-size: 15px; font-weight: 900; color: #9ca3af;">${group.startWith}</span>
      </button>
    `).join('');
    container.innerHTML = cleanList.map(group => {
      const groupId = group.startWith === '#' ? 'simbol' : group.startWith;
      return `
        <div id="az-group-${groupId}" class="scroll-mt-20" style="margin-bottom: 40px;">
          <div class="sticky z-20 flex items-center justify-between backdrop-blur-xl border-y border-white/5 shadow-sm" style="background-color: rgba(10, 15, 28, 0.95); top: 64px; margin-bottom: 16px; margin-left: -20px; margin-right: -20px; padding: 12px 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 38px; height: 38px; border-radius: 12px; background-color: rgba(225, 29, 72, 0.1); border: 1px solid rgba(225, 29, 72, 0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 15px rgba(225,29,72,0.2);">
                <h3 style="font-size: 20px; font-weight: 900; color: #e11d48; margin: 0; line-height: 1;">${group.startWith}</h3>
              </div>
              <span style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em;">${group.animeList.length} Judul</span>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${group.animeList.map(a => `
              <a href="/anime/${a.animeId}" class="relative bg-card/40 hover:bg-brand/10 border border-white/5 hover:border-brand/40 transition-all duration-300 group flex items-center justify-between shadow-sm hover:shadow-[0_8px_25px_rgba(225,29,72,0.15)] active:scale-[0.98] overflow-hidden" style="border-radius: 14px; padding: 10px 16px;">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-brand opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div style="display: flex; align-items: center; flex: 1; min-width: 0; padding-right: 12px; position: relative; z-index: 10;">
                  <span class="text-sm text-gray-300 group-hover:text-white truncate drop-shadow-sm w-full">${a.title}</span>
                </div>
                <svg class="text-gray-600 group-hover:text-brand transition-transform duration-300 group-hover:translate-x-1 relative z-10" style="width: 16px; height: 16px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
              </a>
            `).join('')}
          </div>
        </div>
      `}).join('');
  } else {
    container.innerHTML = '<p class="text-red-500 text-sm text-center bg-red-500/10 p-4 rounded-2xl border border-red-500/20">Gagal memuat direktori A-Z.</p>';
  }
}
async function fetchJadwal() {
  const container = document.getElementById('jadwal-container');
  if(container.children.length > 0 && !container.innerHTML.includes('animate-pulse')) return;
  container.innerHTML = `
    <div class="mb-8 bg-black/20 p-4 rounded-2xl border border-white/5">
      <div class="h-4 w-24 bg-card/50 rounded animate-pulse mb-4"></div>
      <div class="grid grid-cols-2 gap-4"><div class="bg-card/50 animate-pulse rounded-xl pb-[140%]"></div><div class="bg-card/50 animate-pulse rounded-xl pb-[140%]"></div></div>
    </div>
  `;
  const result = await apiFetch('/schedule');
  if (result && Array.isArray(result.data)) {
    container.innerHTML = result.data.map(scheduleDay => `
      <div class="mb-8 bg-black/20 p-4 rounded-2xl border border-white/5 shadow-inner">
        <h3 class="text-brand font-bold uppercase tracking-widest text-sm mb-4 border-b border-brand/20 pb-2 inline-block">${scheduleDay.day}</h3>
        <div class="grid grid-cols-2 gap-4">
          ${scheduleDay.anime_list.map(a => createAnimeCard(a, false)).join('')}
        </div>
      </div>
    `).join('');
  } else {
    container.innerHTML = '<p class="text-red-500 text-sm text-center">Gagal memuat data jadwal.</p>';
  }
}
async function fetchGenreList() {
  const container = document.getElementById('genre-list-container');
  if(container.children.length > 0 && !container.innerHTML.includes('animate-pulse')) return;
  container.innerHTML = Array(6).fill('<div class="h-12 bg-card/50 animate-pulse rounded-xl"></div>').join('');
  const result = await apiFetch('/genre');
  if (result && result.data && result.data.genreList) {
    const genreIcons = {
      'action': '⚔️', 'adventure': '🗺️', 'comedy': '😂', 'demons': '👿', 'drama': '🎭', 'ecchi': '💋', 'fantasy': '🪄', 'game': '🎮', 'harem': '💕', 'historical': '📜', 'horror': '👻', 'josei': '👩', 'magic': '✨', 'martial-arts': '🥋', 'mecha': '🤖', 'military': '🪖', 'music': '🎵', 'mystery': '🕵️‍♂️', 'psychological': '🧠', 'parody': '🤡', 'police': '🚓', 'romance': '❤️', 'samurai': '🗡️', 'school': '🏫', 'sci-fi': '🚀', 'seinen': '👨', 'shoujo': '👧', 'shoujo-ai': '👭', 'shounen': '👦', 'slice-of-life': '☕', 'sports': '⚽', 'space': '🌌', 'super-power': '🦸‍♂️', 'supernatural': '🔮', 'thriller': '😱', 'vampire': '🧛'
    };
    container.innerHTML = result.data.genreList.map(g => {
      const icon = genreIcons[g.genreId] || '🎬';
      const displayTitle = g.title || g.genreId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return `
        <a href="/genre/${g.genreId}" class="bg-card/80 backdrop-blur-sm border border-white/5 p-2.5 rounded-xl flex items-center justify-start gap-3 text-xs font-medium text-gray-300 hover:text-white hover:bg-brand/20 hover:border-brand hover:shadow-[0_5px_15px_rgba(225,29,72,0.4)] transition-all duration-300 active:scale-95 group">
          <div class="bg-dark/60 w-8 h-8 rounded-lg flex items-center justify-center text-base shadow-inner group-hover:scale-110 transition-transform duration-300 shrink-0">${icon}</div>
          <span class="truncate">${displayTitle}</span>
        </a>
      `;
    }).join('');
  } else {
    container.innerHTML = '<p class="text-red-500 text-sm col-span-2 text-center">Gagal memuat daftar genre.</p>';
  }
}
function renderEmptyState() {
  return `
    <div class="col-span-2 flex flex-col items-center justify-center py-16 text-gray-500 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
      <svg class="w-20 h-20 mb-4 text-gray-600 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <p class="text-sm font-bold text-gray-400">Anime tak ditemukan!</p>
      <p class="text-xs mt-1 text-center px-4">Sudah coba dengan kata kunci lain?</p>
    </div>
  `;
}
async function fetchList(apiUrl, hashBase) {
  const container = document.getElementById('list-container');
  const paginationContainer = document.getElementById('list-pagination');
  container.innerHTML = renderSkeletonGrid(6);
  paginationContainer.innerHTML = '';
  const result = await apiFetch(apiUrl);
  if (result && result.data && result.data.animeList && result.data.animeList.length > 0) {
    container.innerHTML = result.data.animeList.map(a => createAnimeCard(a, false)).join('');
    paginationContainer.innerHTML = renderPagination(result.pagination, hashBase);
  } else {
    container.innerHTML = renderEmptyState();
  }
}
window.fetchBookmarks = function() {
  const container = document.getElementById('bookmark-container');
  const bookmarks = JSON.parse(localStorage.getItem('mitaka_bookmarks') || '[]');
  if (bookmarks.length === 0) {
    container.innerHTML = `
      <div class="col-span-2 flex flex-col items-center justify-center py-16 text-gray-500 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
        <svg class="w-20 h-20 mb-4 text-gray-600 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        <p class="text-sm font-bold text-gray-400">Bookmark masih kosong?</p>
        <p class="text-xs mt-1 text-center px-4">Tambahkan melalui halaman detail!</p>
      </div>
    `;
  } else {
    container.innerHTML = bookmarks.map(a => createAnimeCard(a, true)).join('');
  }
};
async function fetchDetail(animeId) {
  const container = document.getElementById('detail-container');
  container.innerHTML = `
    <div class="relative w-full h-72 -mt-16 bg-card/50 animate-pulse border-b border-white/5">
      <div class="absolute bottom-[10px] left-5 w-36 h-52 bg-white/10 rounded-xl"></div>
      <div class="absolute bottom-4 right-5 flex flex-col gap-3"><div class="w-12 h-12 bg-white/10 rounded-full"></div><div class="w-12 h-12 bg-white/10 rounded-full"></div></div>
    </div>
    <div class="p-5 pt-5 relative z-10">
      <div class="h-6 bg-white/10 rounded-md w-3/4 animate-pulse mb-2"></div>
      <div class="h-4 bg-white/10 rounded-md w-1/3 animate-pulse mb-4"></div>
      <div class="flex gap-2 mb-6"><div class="w-16 h-6 bg-white/10 rounded-full animate-pulse"></div><div class="w-16 h-6 bg-white/10 rounded-full animate-pulse"></div></div>
      <div class="h-24 bg-white/10 rounded-2xl animate-pulse mb-6"></div>
      <div class="h-32 bg-white/10 rounded-2xl animate-pulse mb-6"></div>
      <div class="h-6 bg-white/10 rounded-md w-1/3 animate-pulse mb-4"></div>
      <div class="grid grid-cols-2 gap-2.5"><div class="h-12 bg-white/10 rounded-xl animate-pulse"></div><div class="h-12 bg-white/10 rounded-xl animate-pulse"></div></div>
    </div>`;
  const result = await apiFetch(`/anime/${animeId}`);
  if (!result) return container.innerHTML = '<p class="text-red-500 p-5 text-center">Gagal memuat detail.</p>';
  const anime = result.data;
  const sinopsisText = anime.synopsis.paragraphs.length > 0 ? anime.synopsis.paragraphs[0].substring(0, 150) + '...' : `Nonton ${anime.title} subtitle Indonesia gratis.`;
  updateSEO(`${anime.title} - Mitaka Anime`, sinopsisText, anime.poster);
  const bookmarks = JSON.parse(localStorage.getItem('mitaka_bookmarks') || '[]');
  const isBookmarked = bookmarks.some(b => b.animeId === animeId);
  let recommendedHTML = '';
  if (anime.recommendedAnimeList && anime.recommendedAnimeList.length > 0) {
    recommendedHTML = `
      <h3 class="font-bold mt-10 mb-4 border-l-4 border-brand pl-3 text-white text-lg drop-shadow-[0_0_10px_rgba(225,29,72,0.5)]">Rekomendasi Serupa</h3>
      <div class="grid grid-cols-2 gap-4">${anime.recommendedAnimeList.map(a => createAnimeCard(a, false)).join('')}</div>
    `;
  }
  const batchId = anime.batch ? (typeof anime.batch === 'string' ? anime.batch : (anime.batch.batchId || anime.batch.id || anime.batch.slug)) : null;
  const batchLink = batchId ? `<a href="/batch/${batchId}" class="mt-4 bg-brand hover:bg-brand/80 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(225,29,72,0.4)] w-full text-[11px] uppercase tracking-wider">Download Batch — Full Episode <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a>` : '';
  container.innerHTML = `
    <div class="relative w-full h-72 -mt-16 overflow-hidden">
      <div class="absolute inset-0 [-webkit-mask-image:linear-gradient(to_top,transparent_0%,black_60%)] [mask-image:linear-gradient(to_top,transparent_0%,black_60%)] z-0">
        <img src="${anime.poster}" class="absolute inset-0 w-full h-full object-cover opacity-50 blur-xl scale-125">
        <div class="absolute inset-0 bg-dark/10"></div>
      </div>
      <div class="absolute bottom-[10px] left-5 w-36 rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden group z-10">
        <img src="${anime.poster}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
      </div>
      <div class="absolute bottom-4 right-5 flex flex-col items-center gap-3 z-10">
        <button onclick="toggleBookmark('${animeId}', '${anime.title.replace(/'/g, "\\'")}', '${anime.poster}', '${anime.score || ''}')" class="bg-card/80 backdrop-blur border border-white/10 p-3.5 rounded-full shadow-lg active:scale-90 transition-transform group">
          <svg id="icon-bookmark" class="w-6 h-6 ${isBookmarked ? 'text-brand fill-brand drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]' : 'text-gray-400 group-hover:text-white'}" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        </button>
        <a href="/episode/${anime.episodeList[0]?.episodeId || ''}" class="bg-brand hover:bg-brand/80 text-white p-3.5 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.6)] transition-transform active:scale-95">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
        </a>
      </div>
    </div>
    <div class="p-5 pt-5 relative z-10">
      <div class="flex justify-between items-start gap-3">
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-bold text-white leading-tight drop-shadow-md">${anime.title}</h2>
          <p class="text-xs text-brand font-bold tracking-widest mt-1 opacity-90">Subtitle Indonesia</p>
        </div>
      </div>
      ${renderGenreBadges(anime.genreList)}
      ${renderInfoGrid(anime)}
      ${renderInfoList(anime)}
      ${batchLink}
      <h3 class="font-bold mt-8 mb-3 border-l-4 border-brand pl-3 text-white text-lg">Sinopsis</h3>
      <p class="text-xs text-gray-400 leading-relaxed opacity-90">${anime.synopsis.paragraphs.join('<br/><br/>') || 'Sinopsis belum ditambahkan.'}</p>
      <h3 class="font-bold mt-10 mb-4 border-l-4 border-brand pl-3 text-white text-lg">Daftar Episode</h3>
      <div class="grid grid-cols-2 gap-2.5">
        ${anime.episodeList.map(eps => `
          <a href="/episode/${eps.episodeId}" class="bg-card/80 backdrop-blur border border-white/5 hover:border-brand hover:bg-brand/10 p-3 rounded-xl flex justify-between items-center text-left transition-all active:scale-[0.98] group shadow-sm hover:shadow-[0_5px_15px_rgba(225,29,72,0.2)] hover:-translate-y-0.5">
            <span class="text-xs font-medium text-gray-300 group-hover:text-white line-clamp-1 capitalize">${formatEpisodeTitle(eps.title)}</span>
            <div class="bg-black/30 group-hover:bg-brand p-1.5 rounded-lg transition-colors"><svg class="w-3.5 h-3.5 text-gray-400 group-hover:text-white shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg></div>
          </a>
        `).join('')}
      </div>
      ${recommendedHTML}
    </div>
  `;
}
async function fetchEpisode(episodeId) {
  const container = document.getElementById('episode-container');
  container.innerHTML = `
    <div class="relative w-full">
      <div class="absolute top-0 left-0 right-0 h-[300px] bg-card/50 animate-pulse z-0"></div>
      <div class="relative z-10 pt-6 px-5 mt-4"><div class="h-5 bg-white/10 rounded w-2/3 animate-pulse mb-2"></div><div class="h-3 bg-white/10 rounded w-1/3 animate-pulse"></div></div>
      <div class="relative pt-4 px-4 pb-4 z-10">
        <div class="w-full aspect-video bg-white/10 animate-pulse rounded-[14px] mb-4"></div>
        <div class="grid grid-cols-4 gap-2.5"><div class="h-14 bg-white/10 rounded-xl animate-pulse"></div><div class="h-14 bg-white/10 rounded-xl animate-pulse"></div><div class="h-14 bg-white/10 rounded-xl animate-pulse"></div><div class="h-14 bg-white/10 rounded-xl animate-pulse"></div></div>
      </div>
      <div class="px-5 pb-6 relative z-10"><div class="h-32 bg-white/10 rounded-2xl animate-pulse mb-4"></div><div class="h-40 bg-white/10 rounded-2xl animate-pulse"></div></div>
    </div>`;
  const epResult = await apiFetch(`/episode/${episodeId}`);
  if (!epResult) return container.innerHTML = '<p class="text-red-500 p-5 text-center">Gagal memuat video.<br/>Coba refresh halaman!</p>';
  const ep = epResult.data;
  const animeResult = await apiFetch(`/anime/${ep.animeId}`);
  if (!animeResult) return container.innerHTML = '<p class="text-red-500 p-5 text-center">Gagal memuat info anime.</p>';
  const detailOk = animeResult.data;
  const animePoster = detailOk.poster;
  const animeTitle = detailOk.title;
  updateSEO(`Download ${ep.title}`, `Streaming dan download ${ep.title} gratis di Mitaka Anime, kualitas 360p hingga 1080p dengan sub Indo/Indonesia.`, animePoster);
  saveToHistory(ep.animeId, animeTitle, animePoster, episodeId, ep.title);
  const bookmarks = JSON.parse(localStorage.getItem('mitaka_bookmarks') || '[]');
  const isBookmarked = bookmarks.some(b => b.animeId === ep.animeId);
  let currentEpisodeLabel = formatEpisodeTitle(ep.title);
  if (!currentEpisodeLabel.includes("Episode")) {
    const match = ep.title.match(/(Episode|Eps|OVA|OAD|Movie)\s?\d+(\.\d+)?/i);
    if (match) currentEpisodeLabel = match[0];
    else if (ep.title.toLowerCase().includes('movie')) currentEpisodeLabel = "Movie";
    else if (ep.title.toLowerCase().includes('ova')) currentEpisodeLabel = "OVA";
    else currentEpisodeLabel = "Episode Spesial";
  }
  const actionRowHTML = `
    <div class="mt-4" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px;">
      <button onclick="toggleBookmark('${ep.animeId}', '${animeTitle.replace(/'/g, "\\'")}', '${animePoster}', '')" class="bg-card/80 border border-white/5 p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 active:scale-95 group transition-colors">
        <svg id="icon-bookmark" class="w-5 h-5 ${isBookmarked ? 'text-brand fill-brand drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]' : 'text-gray-400 group-hover:text-white'}" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        <span class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter group-hover:text-white">Simpan</span>
      </button>
      <button onclick="toggleServerModal()" class="bg-brand/10 border border-brand/30 p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 active:scale-95 group transition-colors">
        <svg class="w-5 h-5 text-brand drop-shadow-[0_0_5px_rgba(225,29,72,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
        <span class="text-[9px] font-bold text-white uppercase tracking-tighter">Resolusi</span>
      </button>
      <button onclick="toggleLights()" class="bg-card/80 border border-white/5 p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 active:scale-95 group transition-colors">
        <svg id="icon-lights" class="w-5 h-5 text-gray-400 group-hover:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
        <span id="text-lights" class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter group-hover:text-yellow-400">Fokus</span>
      </button>
      <button onclick="shareEpisode('${ep.title.replace(/'/g, "\\'")}')" class="bg-card/80 border border-white/5 p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 active:scale-95 group transition-colors">
        <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
        <span class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter group-hover:text-blue-400">Bagikan</span>
      </button>
    </div>
  `;
  let serverLoading = `<div id="server-loading" class="hidden relative mb-3 text-center flex justify-center items-center gap-2 bg-brand/10 border border-brand/20 py-2.5 rounded-xl"><svg class="animate-spin h-3.5 w-3.5 text-brand" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span class="text-[9px] text-brand font-bold tracking-widest uppercase animate-pulse">Menghubungkan!</span></div>`;
  let serverModalHTML = '';
  if (ep.server && ep.server.qualities && ep.server.qualities.length > 0) {
    serverModalHTML = `
      <div id="server-modal" class="fixed inset-0 z-[100] hidden flex flex-col justify-end items-center pointer-events-none">
        <div id="server-backdrop" class="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 opacity-0 pointer-events-auto" onclick="toggleServerModal()"></div>
        <div class="relative w-full max-w-md mx-auto flex flex-col justify-end h-full pointer-events-none">
          <div id="server-sheet" class="relative w-full flex flex-col pointer-events-auto transform translate-y-full transition-transform duration-300 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]" style="background-color: #0b101e; border-top: 1px solid rgba(255,255,255,0.05); border-top-left-radius: 20px; border-top-right-radius: 20px; max-height: 85vh; padding-bottom: max(env(safe-area-inset-bottom), 1rem);">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;">
              <h3 style="color: white; font-weight: bold; font-size: 16px; margin: 0; display: flex; align-items: center; gap: 10px;"><svg width="20" height="20" style="color: #e11d48;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg> Pilih Resolusi & Server</h3>
              <button onclick="toggleServerModal()" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05); border-radius: 50%; padding: 8px; color: #9ca3af; cursor: pointer; display: flex; align-items: center; justify-content: center;"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <div class="overflow-y-auto no-scrollbar" style="padding: 24px;">
              ${ep.server.qualities.map(q => `
                <div style="margin-bottom: 24px;">
                  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;"><h4 style="font-size: 14px; font-weight: bold; color: #e5e7eb; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">${q.title}</h4><span style="font-size: 10px; color: #e11d48; background: rgba(225,29,72,0.1); border: 1px solid rgba(225,29,72,0.2); padding: 3px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Resolusi</span></div>
                  <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;">
                    ${q.serverList.map(srv => `
                      <button onclick="changeServerChip(this, '${srv.serverId}')" class="server-chip hover:bg-brand/10 hover:border-brand/50 transition-colors" style="background-color: #141b29; border: 1px solid rgba(255,255,255,0.05); border-radius: 9999px; display: flex; align-items: center; padding: 6px 9px; width: 100%; cursor: pointer;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: #6b7280; flex-shrink: 0; margin-right: 12px;"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                        <span style="font-size: 12px; font-weight: 700; color: #d1d5db; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-top: 1px;">${srv.title.trim()}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }
  let navButtons = '';
  if (ep.hasPrevEpisode && ep.prevEpisode) {
    navButtons += `<a href="/episode/${ep.prevEpisode.episodeId}" class="bg-card/80 hover:bg-white/10 text-white text-[10px] font-medium py-3 px-3 rounded-xl transition-all border border-white/5 flex items-center justify-center gap-1.5 shadow-sm flex-1 active:scale-95"><svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg><span>Previous Episode</span></a>`;
  } else {
    navButtons += `<button disabled class="bg-card/30 text-gray-600 text-[10px] font-medium py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed border border-transparent flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg><span>Previous Episode</span></button>`;
  }
  if (ep.hasNextEpisode && ep.nextEpisode) {
    navButtons += `<a href="/episode/${ep.nextEpisode.episodeId}" class="bg-brand hover:bg-brand/80 text-white text-[10px] font-bold py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(225,29,72,0.4)] flex-1 active:scale-95 tracking-wide"><span>Next Episode</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a>`;
  } else {
    navButtons += `<button disabled class="bg-card/30 text-gray-600 text-[10px] font-medium py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed border border-transparent flex-1"><span>Next Episode</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>`;
  }
  let allEpisodesHTML = '';
  if (ep.info && ep.info.episodeList && ep.info.episodeList.length > 0) {
    allEpisodesHTML = `
      <div class="relative z-10 mt-4 bg-black/20 p-4 rounded-2xl border border-white/5 shadow-inner">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16"></path></svg> Pilih Episode</h3>
          <a href="/anime/${ep.animeId}" class="group relative inline-flex items-center gap-1 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 hover:border-brand/50 hover:bg-brand/10 rounded-full text-xs font-bold text-gray-400 hover:text-white transition-all duration-300 active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(225,29,72,0.2)] uppercase">Detail Anime <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></a>
        </div>
        <div class="max-h-48 overflow-y-auto no-scrollbar pr-1" style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px;">
          ${ep.info.episodeList.map(episode => {
            let displayNum = "SP";
            const match = episode.title.match(/(Episode|Eps|OVA|OAD|Movie)\s?\d+(\.\d+)?/i);
            if (match) displayNum = match[0].replace(/Episode\s?|Eps\s?/i, '');
            const isActive = episode.episodeId === episodeId;
            return `<a href="/episode/${episode.episodeId}" class="flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all active:scale-90 ${isActive ? 'bg-brand text-white shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse' : 'bg-card/80 border border-white/5 text-gray-300 hover:text-white hover:border-brand/50 hover:bg-white/10'}">${displayNum}</a>`;
          }).join('')}
        </div>
      </div>
    `;
  }
  container.innerHTML = `
    <div class="relative w-full">
      <div class="absolute top-0 left-0 right-0 h-[300px] z-0 pointer-events-none [-webkit-mask-image:linear-gradient(to_top,transparent_0%,black_100%)] [mask-image:linear-gradient(to_top,transparent_0%,black_100%)]">
        <img src="${animePoster}" class="absolute inset-0 w-full h-full object-cover opacity-20 blur-[30px] scale-125">
      </div>
      <div class="relative z-10 pt-6 px-5 mt-4">
        <h2 class="text-base font-bold text-white leading-tight drop-shadow-md">${animeTitle}</h2>
        <h3 class="text-xs text-brand font-bold tracking-widest mt-1 opacity-90">${currentEpisodeLabel} Subtitle Indonesia</h3>
      </div>
      <div id="video-section-container" class="relative pt-4 px-4 pb-4 transition-all duration-500 rounded-b-[24px]">
        <div id="video-wrapper" class="relative w-full aspect-video rounded-[14px] ring-1 ring-white/10 overflow-hidden bg-black group cursor-pointer shadow-lg" onclick="playVideo('${ep.defaultStreamingUrl}')">
          <img src="${animePoster}" class="absolute inset-0 w-full h-full object-cover blur-sm opacity-60 scale-105 group-hover:scale-110 transition-transform duration-700">
          <div class="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/30 group-hover:bg-black/10 transition-colors">
            <div class="w-14 h-14 bg-brand rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(225,29,72,1)] group-hover:scale-110 transition-transform duration-300 border-2 border-brand">
              <svg class="w-7 h-7 text-white translate-x-[2px]" fill="currentColor" viewBox="0 0 24 24"><path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"/></svg>
            </div>
          </div>
        </div>
        ${actionRowHTML}
        <div class="flex gap-2.5 w-full mt-4">
          ${navButtons}
        </div>
        <div class="mt-4">${serverLoading}</div>
      </div>
      ${serverModalHTML}
      <div class="relative z-10 pb-6 px-5 mt-2">
        ${allEpisodesHTML}
        ${renderDownloadLinks(ep.downloadUrl?.qualities || ep.downloadUrl, false)}
        <div class="relative z-10 mt-4 bg-card/50 p-4 rounded-2xl border border-white/5 shadow-inner">
          <h3 class="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">Informasi Anime</h3>
          <div class="left-5 w-36 rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden group z-10 mb-4">
            <img src="${detailOk.poster}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
          </div>
          ${renderGenreBadges(detailOk.genreList)}
          <div class="flex flex-col gap-3">
            ${renderInfoGrid(detailOk)}
            ${renderInfoList(detailOk)}
          </div>
        </div>
      </div>
    </div>
  `;
}
async function fetchBatch(batchId) {
  const container = document.getElementById('batch-container');
  container.innerHTML = `
    <div class="relative w-full h-72 -mt-16 bg-card/50 animate-pulse border-b border-white/5">
      <div class="absolute bottom-[10px] left-5 w-36 h-52 bg-white/10 rounded-xl"></div>
    </div>
    <div class="p-5 pt-5 relative z-10">
      <div class="h-6 bg-white/10 rounded w-3/4 animate-pulse mb-2"></div>
      <div class="h-4 bg-white/10 rounded w-1/3 animate-pulse mb-4"></div>
      <div class="h-12 bg-white/10 rounded-2xl animate-pulse mb-4"></div>
      <div class="h-32 bg-white/10 rounded-2xl animate-pulse mb-6"></div>
      <div class="h-40 bg-white/10 rounded-2xl animate-pulse mb-6"></div>
    </div>`;
  const result = await apiFetch(`/batch/${batchId}`);
  if (!result) return container.innerHTML = '<p class="text-red-500 p-5 text-center">Gagal memuat batch.<br/>Coba refresh halaman!</p>';
  const ep = result.data;
  updateSEO(`Download ${ep.title} Subtitle Indonesia`, `Download ${ep.title} batch resolusi 360p hingga 1080p subtitle Indonesia lengkap dengan beragam pilihan server.`, ep.poster);
  let gridItems = [];
  if (ep.duration) gridItems.push(`<div class="flex flex-col items-center"><svg class="w-4 h-4 text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span class="font-bold text-white line-clamp-1">Uncounted</span></div>`);
  if (ep.episodes) gridItems.push(`<div class="flex flex-col items-center border-l border-white/10"><svg class="w-4 h-4 text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg><span class="font-bold text-white line-clamp-1 uppercase">${ep.episodes} Eps</span></div>`);
  if (ep.score) gridItems.push(`<div class="flex flex-col items-center border-l border-white/10"><svg class="w-4 h-4 text-yellow-500 mb-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg><span class="font-bold text-yellow-500 line-clamp-1">${ep.score}</span></div>`);
  let detailsGrid = gridItems.length > 0 ? `<div class="grid ${gridItems.length === 1 ? 'grid-cols-1' : (gridItems.length === 2 ? 'grid-cols-2' : 'grid-cols-3')} gap-2 mt-4 mb-2 bg-black/30 border border-white/5 p-3 rounded-2xl text-center text-[10px] backdrop-blur-md shadow-inner">${gridItems.join('')}</div>` : '';
  let downloadQualities = Array.isArray(ep.downloadUrl) ? ep.downloadUrl : (ep.downloadUrl?.qualities || ep.downloadUrl?.formats || []);
  container.innerHTML = `
    <div class="relative w-full h-72 -mt-16 overflow-hidden">
      <div class="absolute inset-0 [-webkit-mask-image:linear-gradient(to_top,transparent_0%,black_60%)] [mask-image:linear-gradient(to_top,transparent_0%,black_60%)] z-0">
        <img src="${ep.poster}" class="absolute inset-0 w-full h-full object-cover opacity-50 blur-xl scale-125">
        <div class="absolute inset-0 bg-dark/10"></div>
      </div>
      <div class="absolute bottom-[10px] left-5 w-36 rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden group z-10">
        <img src="${ep.poster}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
      </div>
    </div>
    <div class="p-5 pt-5 relative z-10">
      <div class="flex justify-between items-start gap-3">
        <div class="flex-1 min-w-0">
          <h2 class="text-base font-bold text-white leading-tight drop-shadow-md">${ep.title.replace(/\s*\[BATCH\]\s*/gi, '').trim()}</h2>
          <p class="text-xs text-brand font-bold tracking-widest mt-1 opacity-90">Batch Subtitle Indonesia</p>
        </div>
      </div>
      ${renderGenreBadges(ep.genreList)}
      ${detailsGrid}
      ${renderInfoList(ep)}
      ${renderDownloadLinks(downloadQualities, true)}
      <div class="mt-10 mb-4 flex justify-center">
        <a href="/anime/${ep.animeId || ep.slug}" class="group relative inline-flex items-center gap-1 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 hover:border-brand/50 hover:bg-brand/10 rounded-full text-xs font-bold text-gray-400 hover:text-white transition-all duration-300 active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(225,29,72,0.2)] uppercase">
          Detail Anime <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </a>
      </div>
    </div>
  `;
}
function playVideo(url) {
  const wrapper = document.getElementById('video-wrapper');
  wrapper.innerHTML = `<iframe src="${url}" class="absolute inset-0 w-full h-full z-10 rounded-xl" allowfullscreen allow="autoplay"></iframe>`;
  wrapper.onclick = null;
  wrapper.classList.remove('cursor-pointer');
}
window.changeServerSelect = async function(selectElement) {
  const serverId = selectElement.value;
  if (!serverId) return;
  const wrapper = document.getElementById('video-wrapper');
  const loadingIndicator = document.getElementById('server-loading');
  selectElement.disabled = true;
  selectElement.classList.add('opacity-50', 'cursor-not-allowed');
  if (loadingIndicator) loadingIndicator.classList.remove('hidden');
  const result = await apiFetch(`/server/${serverId}`);
  if (result && result.data && result.data.url) {
    wrapper.innerHTML = `<iframe src="${result.data.url}" class="absolute inset-0 w-full h-full z-10 rounded-xl" allowfullscreen allow="autoplay"></iframe>`;
    wrapper.onclick = null;
    wrapper.classList.remove('cursor-pointer');
  } else {
    showToast("Gagal menghubungkan ke server.", "error");
    selectElement.value = "";
  }
  selectElement.disabled = false;
  selectElement.classList.remove('opacity-50', 'cursor-not-allowed');
  if (loadingIndicator) loadingIndicator.classList.add('hidden');
};
window.toggleServerModal = function() {
  const modal = document.getElementById('server-modal');
  const sheet = document.getElementById('server-sheet');
  const backdrop = document.getElementById('server-backdrop');
  if (!modal) return;
  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      backdrop.classList.replace('opacity-0', 'opacity-100');
      sheet.classList.remove('translate-y-full');
    });
  } else {
    backdrop.classList.replace('opacity-100', 'opacity-0');
    sheet.classList.add('translate-y-full');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }
};
window.changeServerChip = async function(btn, serverId) {
  if (!serverId) return;
  document.querySelectorAll('.server-chip').forEach(el => {
    el.classList.remove('bg-brand/20', 'border-brand', 'text-white', 'ring-1', 'ring-brand');
    el.classList.add('bg-card', 'border-white/10', 'text-gray-400');
  });
  btn.classList.remove('bg-card', 'border-white/10', 'text-gray-400');
  btn.classList.add('bg-brand/20', 'border-brand', 'text-white', 'ring-1', 'ring-brand');
  const wrapper = document.getElementById('video-wrapper');
  const loadingIndicator = document.getElementById('server-loading');
  if (loadingIndicator) loadingIndicator.classList.remove('hidden');
  const result = await apiFetch(`/server/${serverId}`);
  if (result && result.data && result.data.url) {
    wrapper.innerHTML = `<iframe src="${result.data.url}" class="absolute inset-0 w-full h-full z-10 rounded-xl" allowfullscreen allow="autoplay"></iframe>`;
    wrapper.onclick = null;
    wrapper.classList.remove('cursor-pointer');
    toggleServerModal();
  } else {
    showToast("Gagal menghubungkan ke server.", "error");
  }
  if (loadingIndicator) loadingIndicator.classList.add('hidden');
};
window.toggleLights = function() {
  let overlay = document.getElementById('lights-overlay');
  const icon = document.getElementById('icon-lights');
  const text = document.getElementById('text-lights');
  const videoContainer = document.getElementById('video-section-container');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'lights-overlay';
    overlay.className = 'fixed inset-0 bg-black z-[40] opacity-0 transition-opacity duration-500 pointer-events-none';
    document.body.appendChild(overlay);
  }
  if (overlay.classList.contains('opacity-0')) {
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-95', 'pointer-events-auto');
    videoContainer.classList.add('relative', 'z-[50]');
    icon.classList.replace('text-gray-400', 'text-yellow-400');
    icon.setAttribute('fill', 'currentColor');
    text.classList.replace('text-gray-400', 'text-yellow-400');
    text.innerText = "Nyala";
    overlay.onclick = toggleLights;
  } else {
    overlay.classList.replace('opacity-95', 'opacity-0');
    overlay.classList.replace('pointer-events-auto', 'pointer-events-none');
    setTimeout(() => videoContainer.classList.remove('relative', 'z-[50]'), 500);
    icon.classList.replace('text-yellow-400', 'text-gray-400');
    icon.setAttribute('fill', 'none');
    text.classList.replace('text-yellow-400', 'text-gray-400');
    text.innerText = "Fokus";
  }
};
window.shareEpisode = async function(title) {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Nonton ${title}`,
        text: `Tonton ${title} Sub Indo Gratis di Mitaka Anime!`,
        url: url
      });
    } catch (err) { console.log('Share dibatalkan'); }
  } else {
    navigator.clipboard.writeText(url);
    showToast("Link berhasil disalin!", "success");
  }
};
document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
document.addEventListener('copy', function(e) { e.preventDefault(); });
document.addEventListener('cut', function(e) { e.preventDefault(); });
document.addEventListener('dragstart', function(e) { e.preventDefault(); });
const heroSearchForm = document.getElementById('hero-search-form');
if (heroSearchForm) {
  heroSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const keyword = document.getElementById('hero-search-input').value.trim();
    if (keyword) {
      document.getElementById('hero-search-input').value = '';
      window.navigateTo(`/search/${encodeURIComponent(keyword)}/1`);
    }
  });
}
document.getElementById("tahun").innerHTML = new Date().getFullYear();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/script/sw.js').catch(err => {
      console.log('ServiceWorker gagal didaftarkan: ', err);
    });
  });
}
