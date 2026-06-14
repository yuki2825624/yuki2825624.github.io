<script>
    // import { onMount } from "svelte";
    import Swiper from "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs";

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
                disableOnInteraction: false, // ホバー時無効
            },
            breakpoints: {
                1024: {
                    slidesPerView: 7,
                },
                1280: {
                    slidesPerView: 10,
                },
            },
            on: {
                resize(swiper) {
                    if (swiper.isLocked) {
                        swiper.slideTo(0, 0, false);
                    }
                },
            },
        };

        new Swiper(row, config);
    });

    let rows = [];

    const skills = [
        // 言語
        {
            title: "HTML",
            href: "https://developer.mozilla.org/ja/docs/Web/HTML",
            glowColor: "#e44d26",
            icon: "HTML.svg",
        },
        {
            title: "CSS",
            href: "https://developer.mozilla.org/ja/docs/Web/CSS",
            glowColor: "#264de4",
            icon: "CSS.svg",
        },
        {
            title: "JavaScript",
            href: "https://developer.mozilla.org/ja/docs/Web/JavaScript",
            glowColor: "#f7df1e",
            icon: "JavaScript.svg",
        },
        {
            title: "TypeScript",
            href: "https://www.typescriptlang.org/",
            glowColor: "#3178c6",
            icon: "TypeScript.svg",
        },
        {
            title: "Python",
            href: "https://www.python.org/",
            glowColor: "#306998",
            icon: "Python.svg",
        },
        {
            title: "Java",
            href: "https://www.oracle.com/java/",
            glowColor: "#b07219",
            icon: "Java-Light.svg",
        },
        {
            title: "C",
            href: "https://www.iso.org/standard/74528.html",
            glowColor: "#5555ff",
            icon: "C.svg",
        },
        {
            title: "C#",
            href: "https://learn.microsoft.com/en-us/dotnet/csharp/",
            glowColor: "#9a4eae",
            icon: "CS.svg",
        },
    ];

    const tools = [
        {
            title: "VSCode",
            href: "https://code.visualstudio.com/",
            glowColor: "#007acc",
            icon: "VSCode-Light.svg",
        },
        {
            title: "Visual Studio",
            href: "https://visualstudio.microsoft.com/",
            glowColor: "#5c2d91",
            icon: "VisualStudio-Light.svg",
        },
        {
            title: "IntelliJ IDEA",
            href: "https://www.jetbrains.com/idea/",
            glowColor: "#000",
            icon: "Idea-Light.svg",
        },
        {
            title: "nodejs",
            href: "https://nodejs.org/",
            glowColor: "#339933",
            icon: "NodeJS-Light.svg",
        },
        {
            title: "Git",
            href: "https://git-scm.com/",
            glowColor: "#f05032",
            icon: "Git.svg",
        },
        {
            title: "GitHub",
            href: "https://github.com/",
            glowColor: "#181717",
            icon: "Github-Light.svg",
        },
        {
            title: "Vite",
            href: "https://vite.dev/",
            glowColor: "#646cff",
            icon: "Vite-Light.svg",
        },
        {
            title: "Vuejs",
            href: "https://vuejs.org/",
            glowColor: "#42b883",
            icon: "VueJS-Light.svg",
        },
        {
            title: "Nuxtjs",
            href: "https://nuxt.com/",
            glowColor: "#00dc82",
            icon: "NuxtJS-Light.svg",
        },
        {
            title: "React",
            href: "https://react.dev/",
            glowColor: "#61dafb",
            icon: "React-Light.svg",
        },
        {
            title: "TailwindCSS",
            href: "https://tailwindcss.com/",
            glowColor: "#06b6d4",
            icon: "TailwindCSS-Light.svg",
        },
        {
            title: "Electron",
            href: "https://www.electronjs.org/",
            glowColor: "#47848f",
            icon: "Electron.svg",
        },
        {
            title: "Unity",
            href: "https://unity.com/",
            glowColor: "#000",
            icon: "Unity-Light.svg",
        },
    ];

    const baseIconUrl = "https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons";

    // onMount(() => {
    //     rows.forEach((row) => {
    //         const enabled = !row.classList.contains("disabled");

    //         const config = {
    //             loop: true,
    //             slidesPerView: 5,
    //             centerInsufficientSlides: true,
    //             speed: enabled ? 600 : 0,
    //             allowTouchMove: enabled,
    //             simulateTouch: enabled,
    //             autoplay: enabled
    //                 ? {
    //                       delay: 3000,
    //                       disableOnInteraction: false,
    //                   }
    //                 : false,
    //             breakpoints: {
    //                 1024: {
    //                     slidesPerView: 7,
    //                 },
    //                 1280: {
    //                     slidesPerView: 10,
    //                 },
    //             },
    //             on: {
    //                 resize(swiper) {
    //                     if (swiper.isLocked) {
    //                         swiper.slideTo(0, 0, false);
    //                     }
    //                 },
    //             },
    //         };

    //         Object.assign(row, config);
    //         row.initialize?.();
    //     });
    // });
</script>

<div class="skills-container">
    <!-- 空row -->
    <div class="skills-row disabled" bind:this={rows[0]}>
        <swiper-container class="swiper-wrapper" init="false">
            {#each Array(10) as _}
                <swiper-slide class="swiper-slide">
                    <span class="skill-item"></span>
                </swiper-slide>
            {/each}
        </swiper-container>
    </div>

    <!-- 言語 -->
    <div class="skills-row" bind:this={rows[1]}>
        <swiper-container class="swiper-wrapper" init="false">
            {#each skills as skill}
                <swiper-slide class="swiper-slide">
                    <a class="skill-item" title={skill.title} href={skill.href} target="_blank" rel="noopener noreferrer" style="--glow-color:{skill.glowColor}">
                        <img src="{baseIconUrl}/{skill.icon}" alt={skill.title} loading="lazy" />
                    </a>
                </swiper-slide>
            {/each}
        </swiper-container>
    </div>

    <!-- ツール -->
    <div class="skills-row" bind:this={rows[2]}>
        <swiper-container class="swiper-wrapper" init="false">
            {#each tools as tool}
                <swiper-slide class="swiper-slide">
                    <a class="skill-item" title={tool.title} href={tool.href} target="_blank" rel="noopener noreferrer" style="--glow-color:{tool.glowColor}">
                        <img src="{baseIconUrl}/{tool.icon}" alt={tool.title} loading="lazy" />
                    </a>
                </swiper-slide>
            {/each}
        </swiper-container>
    </div>

    <!-- 空row -->
    <div class="skills-row disabled" bind:this={rows[3]}>
        <swiper-container class="swiper-wrapper" init="false">
            {#each Array(10) as _}
                <swiper-slide class="swiper-slide">
                    <span class="skill-item"></span>
                </swiper-slide>
            {/each}
        </swiper-container>
    </div>
</div>

<style global>
    .skills-container {
        display: flex;
        flex-direction: column;
        margin: 0 4rem;
        mask-image: linear-gradient(90deg, transparent 0%, #ffffff 4rem, #ffffff calc(100% - 4rem), transparent 100%);
        gap: 2rem;
    }

    .skills-row {
        position: relative;
        overflow: visible;
        width: calc(100% + 6.5rem);
    }

    .skills-row:first-child {
        margin-top: 3rem;
    }

    .skills-row:last-child {
        margin-bottom: 3rem;
    }

    .skills-row:nth-child(2n) {
        transform: translateX(-6.5rem);
    }

    .skill-item {
        position: relative;
        aspect-ratio: 1 / 1;
        border-radius: 2rem;
        margin-right: 2rem;
        padding: 3rem;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #eee;
        box-shadow: 0 0 1rem rgba(3, 7, 18, 0.1);
        background: #fff;
        user-select: none;
        cursor: pointer;
    }

    .skill-item img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .skill-item::before {
        content: "";
        position: absolute;
        inset: 10%;
        background: var(--glow-color);
        filter: blur(4rem);
        z-index: -1;
        opacity: 0;
        transition: opacity 2s ease;
        will-change: opacity;
    }

    .skill-item:hover::before {
        opacity: 1;
        transition: opacity 0.2s ease;
    }

    @media (max-width: 1024px) {
        .skills-container {
            margin: 0 1rem;
            mask-image: none;
        }

        .skill-item {
            padding: 1.5rem;
        }
    }
</style>
