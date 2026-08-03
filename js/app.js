/* ==========================================
 * 1. Supabase 数据库初始化配置
 * ========================================== */
const SUPABASE_URL = 'https://ukxxmxnubxjezkwbbxdr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allProducts = [];

// 页面加载完成后自动请求数据库
document.addEventListener('DOMContentLoaded', () => {
    loadBanners();
    loadProducts();
});

/* ==========================================
 * 2. 从后台/数据库读取数据并渲染
 * ========================================== */

// 加载后台海报（同时支持后台整页装修 JSON 与常规 banners 表）
async function loadBanners() {
    const bannerContainer = document.getElementById('banner');
    if (!bannerContainer) return;

    try {
        // 1. 优先尝试读取装修后台保存的 page_decorations 配置
        let { data: decData } = await db.from('page_decorations').select('*').limit(1);
        
        if (decData && decData.length > 0 && decData[0].config) {
            const config = typeof decData[0].config === 'string' ? JSON.parse(decData[0].config) : decData[0].config;
            const bannerComponent = config.find(c => c.type === 'banner' || c.type === 'slider');
            
            if (bannerComponent && bannerComponent.images && bannerComponent.images.length > 0) {
                bannerContainer.innerHTML = `<img src="${bannerComponent.images[0]}" alt="China Direct Shop Banner">`;
                return;
            }
        }

        // 2. 如果装修数据查不到，自动降级去查 banners 表
        let { data, error } = await db.from('banners').select('*');
        if (error) throw error;

        if (data && data.length > 0) {
            const imgSrc = data[0].image_url || data[0].url || data[0].image || '';
            bannerContainer.innerHTML = `<img src="${imgSrc}" alt="China Direct Shop Banner">`;
        }
    } catch (err) {
        console.error('Error loading banners:', err);
    }
}

// 从数据库渲染后台上传的商品列表
async function loadProducts() {
    const productContainer = document.getElementById('product-list');
    if (!productContainer) return;

    try {
        const { data, error } = await db.from('products').select('*');
        if (error) throw error;

        allProducts = data || [];
        renderProducts(allProducts);
    } catch (err) {
        console.error('Error loading products:', err);
        productContainer.innerHTML = '<p style="text-align:center; padding:20px;">Failed to load products.</p>';
    }
}

// 动态渲染商品 DOM
function renderProducts(products) {
    const productContainer = document.getElementById('product-list');
    if (!productContainer) return;

    if (products.length === 0) {
        productContainer.innerHTML = '<p style="text-align:center; padding:20px;">暂无商品，请在后台添加。</p>';
        return;
    }

    productContainer.innerHTML = products.map(p => {
        const pImg = p.image_url || p.url || p.image || 'https://via.placeholder.com/200';
        return `
            <div class="product-card">
                <img src="${pImg}" alt="${p.title || p.name}">
                <h3>${p.title || p.name || 'Untitled'}</h3>
                <p class="desc">${p.description || ''}</p>
                <p class="price">$${p.price || '0.00'}</p>
                <a href="https://m.me/你的Facebook主页用户名" target="_blank" class="btn-main">Message to Buy</a>
            </div>
        `;
    }).join('');
}

// 搜索商品
function searchProducts() {
    const query = document.getElementById('search').value.toLowerCase();
    const filtered = allProducts.filter(p => {
        const name = (p.title || p.name || '').toLowerCase();
        return name.includes(query);
    });
    renderProducts(filtered);
}

// 分类筛选商品
function filterProducts(category) {
    if (category === '全部') {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

/* ==========================================
 * 3. 头像菜单交互逻辑
 * ========================================== */
function toggleAvatarMenu(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('avatarDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('avatarDropdown');
    const avatarBtn = document.getElementById('avatarBtn');
    if (dropdown && avatarBtn && !avatarBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

function viewAvatar() {
    const logoImg = document.getElementById('site-logo').src;
    window.open(logoImg, '_blank');
    closeAvatarMenu();
}

function triggerAvatarUpload() {
    const fileInput = document.getElementById('avatarInput');
    if (fileInput) fileInput.click();
    closeAvatarMenu();
}

function uploadNewAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('site-logo').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function closeAvatarMenu() {
    const dropdown = document.getElementById('avatarDropdown');
    if (dropdown) dropdown.classList.remove('show');
}
