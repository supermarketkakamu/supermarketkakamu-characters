async function displayManga() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        let page = parseInt(urlParams.get('page')) || 1;
        const perPage = 6; 

        const [mangaRes, adsRes] = await Promise.all([
            fetch('manga.json'),
            fetch('ads.json').catch(() => null)
        ]);

        const allManga = await mangaRes.json();
        const sortedList = [...allManga].sort((a, b) => parseInt(a.id) - parseInt(b.id));

        const menuTagContainer = document.querySelector('.menu-tag-container');
        const footerTagContainer = document.querySelector('.footer-tag-container');
        const containers = [menuTagContainer, footerTagContainer];

        containers.forEach(container => {
            if (container) {
                container.innerHTML = "";
                sortedList.forEach((item) => {
                    const tag = document.createElement('span');
                    tag.className = 'tag';
                    const displayId = parseInt(item.id).toString().padStart(2, '0');
                    tag.textContent = `#${displayId} ${item.title}`;
                    
                    tag.onclick = (e) => {
                        e.preventDefault();
                        const totalIndex = sortedList.findIndex(m => m.id === item.id);
                        const targetPage = Math.floor(totalIndex / perPage) + 1;
                        const targetId = `manga-${item.id}`;
                        
                        const menuOverlay = document.getElementById('menu-overlay');
                        if (menuOverlay) {
                            menuOverlay.classList.remove('is-open');
                            document.body.classList.remove('no-scroll');
                        }
                        
                        if (page === targetPage) {
                            setTimeout(() => {
                                scrollToTarget(targetId);
                            }, 450); 
                        } else {
                            window.location.href = `index.html?page=${targetPage}#${targetId}`;
                        }
                    };
                    container.appendChild(tag);
                });
            }
        });

        const coverArea = document.getElementById('cover-area');
        if (page === 1) {
            coverArea.innerHTML = `<div class="manga-cover"><div class="cover-img-wrapper"><img src="images/000.webp" alt="表紙" class="manga-img"></div></div>`;
        } else {
            coverArea.innerHTML = "";
        }

        const list = document.getElementById('manga-list');
        list.innerHTML = "";
        const startIdx = (page - 1) * perPage;
        const endIdx = startIdx + perPage;
        const currentItems = sortedList.slice(startIdx, endIdx);

        let adTexts = ["……"]; 
        if (adsRes) adTexts = await adsRes.json();

        currentItems.forEach((item, index) => {
            const displayId = parseInt(item.id).toString().padStart(2, '0');
            let html = `
                <article class="manga-unit" id="manga-${item.id}">
                    <div class="manga-no">#${displayId}</div>
                    <h2 class="manga-title">${item.title}</h2>
                    <div class="manga-container">
                        <img src="images/${item.id}.webp" class="manga-img" loading="lazy">
                    </div>
                </article>`;

            if ((index + 1) % 2 === 0) {
                const randomText = adTexts[Math.floor(Math.random() * adTexts.length)];
                html += `
                    <div class="ad-section">
                        <div class="ad-inner">
                            <div class="chara-comment-box">
                                <img src="images/chara-cm.webp" class="chara-cm-img">
                                <div class="balloon">${randomText}</div>
                            </div>
                            <div class="ad-label">advertising</div>
                            <div class="ad-dummy-box">Sponsored</div>
                        </div>
                    </div>`;
            }
            list.insertAdjacentHTML('beforeend', html);
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
        }, { threshold: 0.1 });

        document.querySelectorAll('.manga-unit, .ad-section').forEach(el => observer.observe(el));

        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        nextBtn.textContent = "次のページ";
        if (page > 1) {
            prevBtn.href = `index.html?page=${page - 1}`;
            prevBtn.style.display = "inline-block";
        } else {
            prevBtn.style.display = "none";
        }
        if (endIdx < sortedList.length) {
            nextBtn.href = `index.html?page=${page + 1}`;
            nextBtn.style.display = "inline-block";
            nextBtn.style.width = (page === 1) ? "80%" : "48%";
        } else {
            nextBtn.textContent = "最初から読む";
            nextBtn.href = "index.html?page=1";
            nextBtn.style.display = (page === 1) ? "none" : "inline-block";
        }

        if (window.location.hash) {
            const hashId = window.location.hash.substring(1);
            setTimeout(() => { scrollToTarget(hashId); }, 500); 
        }

    } catch (e) { console.error(e); }
}

function scrollToTarget(id) {
    const target = document.getElementById(id);
    if (!target) return;
    const header = document.querySelector('.main-header');
    const headerHeight = header ? header.getBoundingClientRect().height : 70;
    const rect = target.getBoundingClientRect();
    const targetTop = rect.top + window.pageYOffset;
    window.scrollTo({ top: targetTop - headerHeight, behavior: 'smooth' });
    applyFocusEffect(target);
}

function applyFocusEffect(element) {
    element.classList.add('is-visible');
    element.style.backgroundColor = "rgba(249, 69, 69, 0.1)";
    setTimeout(() => { element.style.backgroundColor = "transparent"; }, 1000);
}

displayManga();

const menuOpen = document.getElementById('menu-open');
const menuClose = document.getElementById('menu-close');
const menuOverlay = document.getElementById('menu-overlay');

menuOpen.addEventListener('click', () => {
    menuOverlay.classList.add('is-open');
    document.body.classList.add('no-scroll');
});
menuClose.addEventListener('click', () => {
    menuOverlay.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
});