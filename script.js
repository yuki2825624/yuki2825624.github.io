// テキストタイピング
document.addEventListener("DOMContentLoaded", () => {
    for (const query of document.querySelectorAll(".typing")) {
        const text = query.getAttribute("data-text").replace(/\;(\s+)?/, ";");

        let index = 0, code = "";
        const interval = setInterval(() => {
            const c = text[index];
            if (c) {
                code += c === ";" ? "<br>" : c;
                query.innerHTML = code + "|";
                index++;
            }
            else {
                clearInterval(interval);
                query.innerHTML = code;
                query.removeAttribute("data-text");
            }
        }, 40);
    }
});

// メニューボタン
document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector(".menu-button");
    const check = document.querySelector("#menu-button-active");
    if (!(button instanceof HTMLElement)) return;
    if (!(check instanceof HTMLInputElement)) return;

    // 回転
    let angle = 0, speed = 1;

    setInterval(() => {
        if (!check.checked) { // メニューボタン (常時回転)
            angle -= speed;
        }
        else { // 閉じるボタン (固定)
            angle = Math.round(angle / 90) * 90;
        }
        button.style.transform = `rotate(${angle}deg)`;
    }, 1000 / (360 / 30)); // 30秒 に 360度 回転

    button.addEventListener("mouseenter", async () => {
        speed = 75;
        setTimeout(() => {
            speed = 1;
        }, 1000 / (360 / 30));
    });
});

// About - Hobby のSwiper
document.addEventListener("DOMContentLoaded", () => {
    const swiper = new Swiper(".hobby-swiper", {
        direction: "horizontal",
        loop: true,
        slidesPerView: 1.5,
        pagination: {
            el: ".hobby-swiper-pagination"
        },
        navigation: {
            nextEl: ".hobby-swiper-next",
            prevEl: ".hobby-swiper-prev"
        },
        scrollbar: {
            el: ".hobby-swiper-scrollbar"
        }
    });
});