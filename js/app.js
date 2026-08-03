/* ==========================================
 * 1. Supabase 数据库初始化配置
 * ========================================== */
const SUPABASE_URL = 'https://ukxxmxnubxjezkwbbxdr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allProducts = [];

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', () => {
    loadSiteAssets(); // 读取保存的封面与头像
    loadBanners();    // 读取动态Banner
    loadProducts();   // 读取商品
});

/* ==========================================
 * 2. 读取保存的头像与封面 (数据库优先，本地缓存备用)
 * ========================================== */
async function loadSiteAssets() {
    // 1. 先尝试从 localStorage 恢复（保证页面刷新时瞬间显示不闪烁）
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

    // 2. 从 Supabase 数据库同步最新链接
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
 * 3. 图片前端自动压缩（防止大图上传触发 Failed to fetch）
 * ========================================== */
function compressImage(file, maxWidth = 1600, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            reject(new Error('图片压缩失败'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

/* ==========================================
 * 4. 存储桶上传通用函数
 * ========================================== */
async function uploadToSupabaseStorage(file, pathFolder) {
    let uploadFile = file;
    try {
        // 封面与头像按需自动压缩
        if (pathFolder === 'covers') {
            uploadFile = await compressImage(file, 1600, 0.8); // 封面压缩至最大宽度 1600px
        } else if (pathFolder === 'avatars') {
            uploadFile = await compressImage(file, 500, 0.85);  // 头像压缩至最大宽度 500px
        }
    } catch (e) {
        console.warn('图片压缩跳过，尝试使用原图上传', e);
    }

    const fileExt = uploadFile.name.split('.').pop() || 'jpg';
    const fileName = `${pathFolder}/${Date.now()}.${fileExt}`;

    // 上传到 Supabase Storage 的 images 存储桶
    const { data, error } = await db.storage
        .from('images')
        .upload(fileName, uploadFile, { cacheControl: '3600', upsert: true });

    if (error) {
        console.error('Storage Upload Error:', error);
        throw new Error('图片上传存储桶失败: ' + error.message);
    }

    // 获取公开访问链接
    const { data: publicUrlData } = db.storage
        .from('images')
        .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
}

// 保存链接到数据库与本地缓存
async function saveSettingToDB(key, value) {
    if (key === 'avatar_url') localStorage.setItem('site_avatar_url', value);
    if (key === 'cover_url') localStorage.setItem('site_cover_url', value);

    const { error } = await db
        .from('site_settings')
        .upsert({ key: key, value: value }, { onConflict: 'key' });

    if (error) {
        console.error(`保存 ${key} 到数据库失败:`, error.message);
    }
}

/* ==========================================
 * 5. 封面海报上传逻辑
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
        bannerContainer.innerHTML = `<p style="color:#fff; text-align:center; padding-top:100px;">正在处理并上传封面，请稍候...</p>`;
    }

    try {
        const imageUrl = await uploadToSupabaseStorage(file, 'covers');
        
        if (bannerContainer) {
            bannerContainer.innerHTML = `<img src="${imageUrl}" alt="Uploaded Cover">`;
        }

        await saveSettingToDB('cover_url', imageUrl);
        alert('封面照片修改成功并已永久保存！');
    } catch (err) {
        alert('修改封面失败: ' + err.message);
        loadBanners(); // 失败恢复
    }
}

/* ==========================================
 * 6. 头像菜单与上传逻辑
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
        alert('头像修改成功并已永久保存！');
    } catch (err) {
        alert('修改头像失败: ' + err.message);
    }
}

function closeAvatarMenu() {
    const dropdown = document.getElementById('avatarDropdown');
    if (dropdown) dropdown.classList.remove('show');
}

/* ==========================================
 * 7. 加载动态 Banner 与商品列表
 * ========================================== */
async function loadBanners() {
    const bannerContainer = document.getElementById('banner');
    if (!bannerContainer) return;

    // 如果用户已经自定义保存了封面，优先展示自定义封面
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
