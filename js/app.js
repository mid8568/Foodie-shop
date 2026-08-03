/* ==========================================
 * 1. Supabase 数据库初始化配置
 * ========================================== */
const SUPABASE_URL = 'https://ukxxmxnubxjezkwbbxdr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allProducts = [];

// 页面加载完成后自动请求数据库
document.addEventListener('DOMContentLoaded', () => {
    loadSiteAssets(); // 读取保存的封面与头像
    loadBanners();    // 读取动态Banner
    loadProducts();   // 读取商品
});

/* ==========================================
 * 2. 读取保存的头像与封面 (数据库优先，本地缓存备用)
 * ========================================== */
async function loadSiteAssets() {
    // 先尝试从 localStorage 恢复（保证瞬间渲染不闪烁）
    const localAvatar = localStorage.getItem('site_avatar_url');
    const localCover = localStorage.getItem('site_cover_url');

    if (localAvatar) {
        const avatarImg = document.getElementById('site-logo');
        if (avatarImg) avatarImg.src = localAvatar;
    }
    if (localCover) {
        const bannerContainer = document.getElementById('banner');
        if (bannerContainer) bannerContainer.innerHTML = `<img src="${localCover}" alt="Cover Banner">`;
    }

    // 再从 Supabase 数据库同步最新链接
    try {
        const { data, error } = await db.from('site_settings').select('*');
        if (error) {
            console.warn('site_settings 读取失败或不存在:', error.message);
            return;
        }

        if (data && data.length > 0) {
            data.forEach(setting => {
                if (setting.key === 'avatar_url' && setting.value) {
                    const avatarImg = document.getElementById('site-logo');
                    if (avatarImg) avatarImg.src = setting.value;
                    localStorage.setItem('site_avatar_url', setting.value);
                }
                if (setting.key === 'cover_url' && setting.value) {
                    const bannerContainer = document.getElementById('banner');
                    if (bannerContainer) bannerContainer.innerHTML = `<img src="${setting.value}" alt="Cover Banner">`;
                    localStorage.setItem('site_cover_url', setting.value);
                }
            });
        }
    } catch (err) {
        console.error('加载站点资源异常:', err);
    }
}

/* ==========================================
 * 3. 核心工具：图片上传至 Supabase Storage
 * ========================================== */
async function uploadToSupabaseStorage(file, pathFolder) {
    // 限制文件大小不超过 5MB
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('图片大小不能超过 5MB！');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${pathFolder}/${Date.now()}.${fileExt}`;

    // 上传到 images 存储桶
    const { data, error } = await db.storage
        .from('images')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) {
        console.error('Storage Upload Error:', error);
        throw new Error('图片上传存储桶失败: ' + error.message);
    }

    // 获取公开访问 URL
    const { data: publicUrlData } = db.storage
        .from('images')
        .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
}

// 保存配置到 site_settings 表
async function saveSettingToDB(key, value) {
    // 同步写入 localStorage
    if (key === 'avatar_url') localStorage.setItem('site_avatar_url', value);
    if (key === 'cover_url') localStorage.setItem('site_cover_url', value);

    const { error } = await db
        .from('site_settings')
        .upsert({ key: key, value: value }, { onConflict: 'key' });

    if (error) {
        console.error(`保存 ${key} 到数据库失败:`, error.message);
        alert(`警告: 本地已更新，但保存至数据库失败 (${error.message})`);
    }
}

/* ==========================================
 * 4. 封面海报上传逻辑
 * ========================================== */
function triggerCoverUpload() {
    const coverInput = document.getElementById('coverInput');
    if (coverInput) coverInput.click();
}

async function uploadNewCover(event) {
    const file = event.target.files[0];
    if (!file) return;

    const bannerContainer = document.getElementById('banner');
    if (bannerContainer) {
        bannerContainer.innerHTML = `<p style="color:#fff; text-align:center; padding-top:100px;">正在上传封面，请稍候...</p>`;
    }

    try {
        const imageUrl = await uploadToSupabaseStorage(file, 'covers');
        
        if (bannerContainer) {
            bannerContainer.innerHTML = `<img src="${imageUrl}" alt="Uploaded Cover">`;
        }

        await saveSettingToDB('cover_url', imageUrl);
        alert('封面照片修改成功并已保存！');
    } catch (err) {
        alert('修改封面失败: ' + err.message);
        loadBanners(); // 恢复默认
    }
}

/* ==========================================
 * 5. 头像菜单与上传逻辑
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

async function uploadNewAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;

    const avatarImg = document.getElementById('site-logo');

    try {
        const imageUrl = await uploadToSupabaseStorage(file, 'avatars');
        
        if (avatarImg) avatarImg.src = imageUrl;

        await saveSettingToDB('avatar_url', imageUrl);
        alert('头像修改成功并已保存！');
    } catch (err) {
        alert('修改头像失败: ' + err.message);
    }
}

function closeAvatarMenu() {
    const dropdown = document.getElementById('avatarDropdown');
    if (dropdown) dropdown.classList.remove('show');
}

/* ==========================================
 * 6. 加载商品与 Banner 数据
 * ========================================== */
async function loadBanners() {
    const bannerContainer = document.getElementById('banner');
    if (!bannerContainer) return;

    // 如果已经有封面图，不再被后台 Banner 覆盖
    if (localStorage.getItem('site_cover_url')) return;

    try {
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

function searchProducts() {
    const query = document.getElementById('search').value.toLowerCase();
    const filtered = allProducts.filter(p => {
        const name = (p.title || p.name || '').toLowerCase();
        return name.includes(query);
    });
    renderProducts(filtered);
}

function filterProducts(category) {
    if (category === '全部') {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category === category);
        renderProducts(filtered);
    }
}
