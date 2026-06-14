

<input id="menu-button-active" type="checkbox" hidden />
<label class="flex items-center justify-center fixed top-0 right-0 w-28 h-28 m-[2.3rem] rounded-full duration-400 bg-main cursor-pointer z-10" for="menu-button-active">
    <img id="hamburger" src="/assets/hamburger-open.svg" alt="hamburger" />
    <img id="close" src="/assets/hamburger-close.svg" alt="close" />
</label>
<label class="menu-overlay" for="menu-button-active"></label>
<div class="menu">
    <div class="flex flex-col gap-6 p-8 text-2xl border-b border-gray-400">
        <a class="flex items-center gap-2 p-2 rounded-full duration-300 hover:bg-hover-on-nav hover:scale-105" href="/">
            <Icon name="fa6-solid:house" class="w-8 h-8" />
            <p>Home</p>
        </a>
        <a class="flex items-center gap-2 p-2 rounded-full duration-300 hover:bg-hover-on-nav hover:scale-105" href="/work">
            <Icon name="fa6-solid:book" class="w-8 h-8" />
            <p>Work</p>
        </a>
        <a class="flex items-center gap-2 p-2 rounded-full duration-300 hover:bg-hover-on-nav hover:scale-105" href="/about">
            <Icon name="fa6-solid:circle-info" class="w-8 h-8" />
            <p>About</p>
        </a>
    </div>
    <div class="flex flex-col gap-4 p-4 text-2xl">
        <h1>Social</h1>
        <div class="grid grid-cols-4 gap-2 place-items-center">
            <a href="https://qiita.com/yuki2825624" target="_blank" class="bg-button p-2 rounded-full w-10 h-10 shadow-button cursor-pointer duration-400 hover:-translate-y-1/8">
                <img src="/assets/qiita.png" alt="qiita" loading="lazy" />
            </a>
            <a href="https://x.com/yuki2825624" target="_blank" class="bg-button p-2 rounded-full w-10 h-10 shadow-button cursor-pointer duration-400 hover:-translate-y-1/8">
                <img src="/assets/x.png" alt="x" loading="lazy" />
            </a>
            <a href="https://github.com/yuki2825624" target="_blank" class="bg-button p-2 rounded-full w-10 h-10 shadow-button cursor-pointer duration-400 hover:-translate-y-1/8">
                <img src="/assets/github.png" alt="github" loading="lazy" />
            </a>
            <a href="https://discord.com/users/964310223235993690" target="_blank" class="bg-button p-2 rounded-full w-10 h-10 shadow-button cursor-pointer duration-400 hover:-translate-y-1/8">
                <img src="/assets/discord.png" alt="discord" loading="lazy" />
            </a>
            <a href="https://steamcommunity.com/profiles/76561199384039065/" target="_blank" class="bg-button p-2 rounded-full w-10 h-10 shadow-button cursor-pointer duration-400 hover:-translate-y-1/8">
                <img src="/assets/steam.png" alt="steam" loading="lazy" />
            </a>
        </div>
    </div>
</div>
