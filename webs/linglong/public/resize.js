(function () {
    let symbol = Symbol.for("screen");
    /**
     * 初始化屏幕分辨率
     */
    if (window[symbol]) {
        return;
    }
    // 设计稿尺寸
    let designSize = {
        width: 1920, // 设计稿屏幕宽度
        height: 1080 // 设计稿屏幕高度
    };

    // 最小分辨率
    let minSize = {
        width: 1024,
        height: 600
    };
    document.documentElement.style.minWidth = `${minSize.width}px`;
    document.documentElement.style.minHeight = `${minSize.height}px`;
    document.documentElement.style.overflow = "auto";
    window[symbol] = {
        designWidth: designSize.width,
        designHeight: designSize.height,
        minSize,
        minHeight: 620, // laptop高度
        resize: function () {
            // document.documentElement.style.fontSize = document.documentElement.clientWidth / 19.2 + "px";
            let fontSize = document.documentElement.clientWidth / (designSize.width / 100) + "px";
            document.documentElement.style.fontSize = `clamp(53px,${fontSize}, 120px)`;
            // 增加字体设置比率
            // 宽度比率
            window.pageRath = Math.round((document.documentElement.clientWidth / 1920) * 10000) / 10000;
        }
    };
    window[symbol].resize();
    addEventListener("resize", window[symbol].resize);
})();
