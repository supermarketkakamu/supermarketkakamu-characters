async function loadStory() {
    const viewer = document.getElementById('viewer');
    const titleEl = document.getElementById('title');

    try {
        // 物語データと広告データを同時に読み込む
        const [storyRes, adsRes] = await Promise.all([
            fetch('data.json'),
            fetch('ads.json').catch(() => null)
        ]);

        if (!storyRes.ok) throw new Error('Story JSON failed');
        const data = await storyRes.json();
        const adsData = adsRes ? await adsRes.json() : { affiliates: [] };
        
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

        // 本編と広告の生成
        displayPages.forEach((page, index) => {
            const sec = document.createElement('section');
            sec.className = 'page-section';
            sec.innerHTML = `
                <img src="images/${page.image_id}.webp" class="ehon-image fade-in" loading="lazy">
                <p class="ehon-text fade-in">${page.text}</p>
            `;
            viewer.appendChild(sec);

            // 3枚ごとに広告を挿入
            const currentPosition = index + 1;
            if (currentPosition % 3 === 0) {
                // 広告のインデックスを計算 (10個を順番にループ)
                const adSlotNum = ((currentPage - 1) * (perPage / 3)) + (currentPosition / 3 - 1);
                const adContent = adsData.affiliates.length > 0 
                    ? adsData.affiliates[adSlotNum % adsData.affiliates.length].html 
                    : "広告枠";

                const ad = document.createElement('div');
                ad.className = 'ad-section fade-in';
                ad.innerHTML = `
                    <div class="ad-label">advertising</div>
                    <div class="ad-rectangle">${adContent}</div>
                `;
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