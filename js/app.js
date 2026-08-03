/* ==========================================
 * 1. Supabase 数据库初始化配置
 * ========================================== */
const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allProducts = [];

// 页面加载完成后自动请求数据
document.addEventListener('DOMContentLoaded', () => {
    loadBanners();
    loadProducts();
});

/* ==========================================
 * 2. 数据库数据加载 (Banner 与 商品)
 * ========================================== */

// 加载 Banner 海报
async function loadBanners() {
    const bannerContainer = document.getElementById('banner');
    if (!bannerContainer) return;

    try {
        const { data, error } = await db.from('banners').select('*').order('id', { ascending: true });
        if (error) throw error;

        if (data && data.length > 0) {
            bannerContainer.innerHTML = data.map(b => `<img src="${b.image_url}" alt="Banner">`).join('');
        } else {
            // 数据库无数据时的默认占位图
            bannerContainer.innerHTML = `<img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200" alt="Banner">`;
        }
    } catch (err) {
        console.error('Error loading banners:', err);
    }
}

// 加载商品列表
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

// 渲染商品 DOM
function renderProducts(products) {
    const productContainer = document.getElementById('product-list');
    if (!productContainer) return;

    if (products.length === 0) {
        productContainer.innerHTML = '<p style="text-align:center; padding:20px;">No products found.</p>';
        return;
    }

    productContainer.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.image_url || 'https://via.placeholder.com/200'}" alt="${p.title || p.name}">
            <h3>${p.title || p.name}</h3>
            <p class="desc">${p.description || ''}</p>
            <p class="price">$${p.price || '0.00'}</p>
            <a href="https://m.me/你的Facebook主页用户名" target="_blank" class="btn-main">Message to Buy</a>
        </div>
    `).join('');
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
 * 3. FB 风格头像点击与替换逻辑
 * ========================================== */

// 显示 / 隐藏头像下拉菜单
function toggleAvatarMenu(event) {
    event.stopPropagation(); // 阻止点击冒泡
    const dropdown = document.getElementById('avatarDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// 点击页面其它空白处时，自动关闭弹窗菜单
document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('avatarDropdown');
    const avatarBtn = document.getElementById('avatarBtn');
    if (dropdown && avatarBtn && !avatarBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// 查看头像：在新窗口打开大图
function viewAvatar() {
    const logoImg = document.getElementById('site-logo').src;
    window.open(logoImg, '_blank');
    closeAvatarMenu();
}

// 选择头像：触发隐藏的上传框
function triggerAvatarUpload() {
    const fileInput = document.getElementById('avatarInput');
    if (fileInput) {
        fileInput.click();
    }
    closeAvatarMenu();
}

// 更换本地选中的图片并实时预览
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

// 辅助函数：关闭下拉菜单
function closeAvatarMenu() {
    const dropdown = document.getElementById('avatarDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}
