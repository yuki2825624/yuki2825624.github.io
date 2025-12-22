import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';

// スキルスワイパー
document.querySelectorAll(".skills-row").forEach((row) => {
    const enabled = !row.classList.contains("disabled");

    const config = {
        loop: true,
        slidesPerView: 5,
        centerInsufficientSlides: true,
        speed: enabled ? 600 : 0, // オートプレイのスクロール間隔(ms)
        allowTouchMove: enabled,
        simulateTouch: enabled,
        autoplay: {
            delay: 3000, // 待ち時間(ms)
            disableOnInteraction: false // ホバー時無効
        },
        breakpoints: {
            1024: {
                slidesPerView: 7,
            },
            1280: {
                slidesPerView: 10,
            }
        },
        on: {
            resize(swiper) {
                if (swiper.isLocked) {
                    swiper.slideTo(0, 0, false);
                }
            },
        }
    };

    new Swiper(row, config);
});