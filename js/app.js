// ==========================================
// 1. 初始化 Supabase 客户端
// ==========================================
const SUPABASE_URL = "https://ukxxmxnubxjezkwbbxdr.supabase.co";
const SUPABASE_KEY = "sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 全局数据缓存
let allProducts = [];
let currentCategory = '全部';
let sliderTimer = null;

// 页面加载完成后触发
document.addEventListener("DOMContentLoaded", async () => {
    // 并行读取 Supabase 中的装修数据与商品列表
    await Promise.all([
        loadDecorationConfig(),
        fetchProducts()
    ]);
});

// ==========================================
// 2. 读取并应用 admin-decoration.html 装修数据
// ==========================================
async function loadDecorationConfig() {
    try {
        const { data, error } = await supabaseClient
            .from("decorations")
            .select("config")
            .eq("id", 1)
            .single();

        if (error) {
            console.warn("未读取到装修配置，将使用默认配置:", error);
            return;
        }

        const config = data?.config || [];
        if (config.length === 0) return;

        // 处理 Banner 板块
        const bannerConfig = config.find(item => item.type === "banner");
        if (bannerConfig && bannerConfig.data) {
            applyBannerDecoration(bannerConfig.data);
        }

        // 处理 公告栏 板块 (如果装修后台添加了公告栏)
        const noticeConfig = config.find(item => item.type === "notice");
        if (noticeConfig && noticeConfig.data) {
            applyNoticeDecoration(noticeConfig.data);
        }

    } catch (err) {
        console.error("加载装修逻辑异常:", err);
    }
}

/**
 * 动态渲染/替换 Banner 轮播图
 */
function applyBannerDecoration(bannerData) {
    const bannerSection = document.querySelector(".banner");
    if (!bannerSection) return;

    const images = bannerData.images || [];
    const height = bannerData.height || 400;
    const interval = bannerData.interval || 3000;

    if (images.length === 0) return;

    // 清除原有内联样式/结构
    bannerSection.style.height = `${height}px`;
    bannerSection.style.padding = "0";
    bannerSection.style.position = "relative";
    bannerSection.style.overflow = "hidden";

    // 只有 1 张图时显示静态 Banner
    if (images.length === 1) {
        bannerSection.innerHTML = `
            <div style="width: 100%; height: 100%; position: relative;">
                <img src="${images[0]}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.6); width: 90%;">
                    <h1 style="font-size: 28px; margin-bottom: 10px;">Authentic Chinese Products</h1>
                    <p style="font-size: 14px; margin-bottom: 15px;">Direct From China · Worldwide Shipping</p>
                    <a href="#product-list" class="btn">Shop Now</a>
                </div>
            </div>`;
        return;
    }

    // 多张图渲染为可自动轮播结构
    let slidesHtml = images.map(url => `
        <div class="slider-slide" style="min-width: 100%; height: 100%; flex-shrink: 0;">
            <img src="${url}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
        </div>
    `).join('');

    let dotsHtml = images.map((_, i) => `
        <div class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="switchSlide(${i})" style="width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.3s;"></div>
    `).join('');

    bannerSection.innerHTML = `
        <div class="slider-track" id="sliderTrack" style="display: flex; width: 100%; height: 100%; transition: transform 0.5s ease-in-out;">
            ${slidesHtml}
        </div>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.6); pointer-events: none; width: 90%; z-index: 2;">
            <h1 style="font-size: 28px; margin-bottom: 10px;">Authentic Chinese Products</h1>
            <p style="font-size: 14px; margin-bottom: 15px;">Direct From China · Worldwide Shipping</p>
            <a href="#product-list" class="btn" style="pointer-events: auto;">Shop Now</a>
        </div>
        <div class="slider-dots" id="sliderDots" style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 3;">
            ${dotsHtml}
        </div>
    `;

    // 绑定高亮圆点样式与自动轮播逻辑
    initAutoSlider(images.length, interval);
}

/**
 * 轮播图定时器逻辑
 */
function initAutoSlider(totalSlides, interval) {
    let currentIndex = 0;
    if (sliderTimer) clearInterval(sliderTimer);

    const track = document.getElementById("sliderTrack");
    const dots = document.querySelectorAll("#sliderDots .slider-dot");

    window.switchSlide = function(index) {
        currentIndex = index;
        if (track) track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, idx) => {
            if (idx === currentIndex) {
                dot.style.background = "#fff";
                dot.style.width = "18px";
                dot.style.borderRadius = "4px";
            } else {
                dot.style.background = "rgba(255,255,255,0.5)";
                dot.style.width = "8px";
                dot.style.borderRadius = "50%";
            }
        });
    };

    sliderTimer = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        window.switchSlide(currentIndex);
    }, interval);
}

/**
 * 动态渲染公告栏 (插入在 Banner 下方)
 */
function applyNoticeDecoration(noticeData) {
    if (!noticeData.text) return;

    let noticeEl = document.getElementById("h5-notice-bar");
    if (!noticeEl) {
        noticeEl = document.createElement("div");
        noticeEl.id = "h5-notice-bar";
        noticeEl.style.cssText = "background: #fffbe6; border: 1px solid #ffe58f; color: #d46b08; padding: 10px 15px; font-size: 13px; margin: 10px; border-radius: 6px; text-align: center;";
        
        const bannerSection = document.querySelector(".banner");
        if (bannerSection && bannerSection.nextSibling) {
            bannerSection.parentNode.insertBefore(noticeEl, bannerSection.nextSibling);
        }
    }
    noticeEl.innerText = noticeData.text;
}

// ==========================================
// 3. 商品数据读取与展示逻辑 (保持原有功能)
// ==========================================
async function fetchProducts() {
    const productContainer = document.getElementById("product-list");
    
    try {
        const { data, error } = await supabaseClient
            .from("products")
            .select("*");

        if (error) {
            console.error("加载商品列表失败:", error);
            if (productContainer) productContainer.innerHTML = `<p style="text-align:center; color:#999; width:100%;">Failed to load products.</p>`;
            return;
        }

        allProducts = data || [];
        renderProducts(allProducts);

    } catch (err) {
        console.error("网络异常:", err);
        if (productContainer) productContainer.innerHTML = `<p style="text-align:center; color:#999; width:100%;">Network error.</p>`;
    }
}

/**
 * 渲染商品卡片列表
 */
function renderProducts(products) {
    const productContainer = document.getElementById("product-list");
    if (!productContainer) return;

    if (!products || products.length === 0) {
        productContainer.innerHTML = `<p style="text-align:center; color:#999; width:100%; padding: 20px 0;">No products found.</p>`;
        return;
    }

    productContainer.innerHTML = products.map(item => `
        <div class="product-card" style="border:1px solid #f0f0f0; border-radius:8px; overflow:hidden; background:#fff; margin-bottom:15px;">
            <img src="${item.image_url || item.image || 'https://via.placeholder.com/300'}" alt="${item.title || item.name}" style="width:100%; height:180px; object-fit:cover; display:block;">
            <div style="padding: 12px;">
                <h3 style="font-size: 15px; margin-bottom: 6px; color:#333;">${item.title || item.name || 'Untitled Product'}</h3>
                <p style="color: #ff4d4f; font-weight: bold; font-size: 16px; margin-bottom: 10px;">$${parseFloat(item.price || 0).toFixed(2)}</p>
                <a href="https://m.me/你的Facebook主页用户名" target="_blank" class="btn" style="display:block; text-align:center; font-size:12px; padding: 6px 0;">Inquire Now</a>
            </div>
        </div>
    `).join('');
}

// ==========================================
// 4. 搜索与分类过滤交互
// ==========================================

// 搜索框输入过滤
function searchProducts() {
    const keyword = document.getElementById("search").value.toLowerCase().trim();
    const filtered = allProducts.filter(p => {
        const name = (p.title || p.name || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        return name.includes(keyword) || category.includes(keyword);
    });
    renderProducts(filtered);
}

// 点击分类按钮过滤
function filterProducts(category) {
    currentCategory = category;
    
    // 更新分类按钮高亮态 (可选优化)
    const buttons = document.querySelectorAll(".h5-category button");
    buttons.forEach(btn => {
        if (btn.innerText.includes(category) || (category === '全部' && btn.innerText.includes('All'))) {
            btn.style.background = "#1890ff";
            btn.style.color = "#fff";
        } else {
            btn.style.background = "";
            btn.style.color = "";
        }
    });

    if (category === '全部') {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category === category);
        renderProducts(filtered);
    }
}
