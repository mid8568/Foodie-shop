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

// 从数据库渲染后台上传的 Banner 海报
async function loadBanners() {
    const bannerContainer = document.getElementById('banner');
    if (!bannerContainer) return;

    try {
        const { data, error } = await db.from('banners').select('*').order('id', { ascending: true });
        if (error) throw error;

        if (data && data.length > 0) {
            // 将后台上传的图片循环渲染到页面
            bannerContainer.innerHTML = data.map(b => `<img src="${b.image_url}" alt="Banner">`).join('');
        } else {
            // 如果后台没上传过任何 Banner，显示备用默认图
            bannerContainer.innerHTML = `<img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200" alt="Default Banner">`;
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
        productContainer.innerHTML = '<p style="text-align:center; padding:20px;">Failed to load products. Check API key.</p>';
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
 * 3. FB 风格头像交互逻辑
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
