async function loadStory() {
    const viewer = document.getElementById('viewer');
    const titleEl = document.getElementById('title');

    try {
        const res = await fetch('data.json');
        if (!res.ok) throw new Error('JSON load failed');
        const data = await res.json();
        
        titleEl.textContent = data.story_title;
        document.title = data.story_title + " | SUPERMARKET KAKAMU";

        const urlParams = new URLSearchParams(window.location.search);
        let currentPage = parseInt(urlParams.get('page')) || 1;
        
        const perPage = 6;
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;

        const allStoryPages = data.pages.filter(p => p.image_id !== "000");
        const displayPages = allStoryPages.slice(startIndex, endIndex);

        // 表紙
        if (currentPage === 1) {
            const cover = data.pages.find(p => p.image_id === "000");
            if (cover) {
                const sec = document.createElement('section');
                sec.className = 'cover-section';
                sec.innerHTML = `
                    <img src="images/000.webp" class="ehon-image fade-in">
                    <p class="ehon-text fade-in">${cover.text}</p>
                `;
                viewer.appendChild(sec);
            }
        }

        // 本編
        displayPages.forEach((page, index) => {
            const sec = document.createElement('section');
            sec.className = 'page-section';
            sec.innerHTML = `
                <img src="images/${page.image_id}.webp" class="ehon-image fade-in" loading="lazy">
                <p class="ehon-text fade-in">${page.text}</p>
            `;
            viewer.appendChild(sec);

            if ((index + 1) % 3 === 0) {
                const ad = document.createElement('div');
                ad.className = 'ad-section fade-in';
                ad.innerHTML = `<div class="ad-label">Advertising</div><div class="ad-rectangle"></div>`;
                viewer.appendChild(ad);
            }
        });

        // 監視設定（ふわっと出す処理）
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0,
            rootMargin: '0px 0px -10% 0px' 
        });

        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

        // ナビボタン
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        if (currentPage > 1) {
            prevBtn.style.display = 'inline-block';
            prevBtn.href = `?page=${currentPage - 1}`;
        }
        if (allStoryPages.length > endIndex) {
            nextBtn.href = `?page=${currentPage + 1}`;
            nextBtn.textContent = "つぎへ";
        } else {
            nextBtn.href = `?page=1`;
            nextBtn.textContent = "はじめから読む";
        }

        window.scrollTo(0, 0);

    } catch (e) {
        console.error(e);
        titleEl.textContent = "Error Loading Content";
    }
}

window.addEventListener('DOMContentLoaded', loadStory);