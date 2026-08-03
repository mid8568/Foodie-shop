// ==========================================
// 1. 初始化 Supabase 客户端
// ==========================================
const SUPABASE_URL = 'https://ukxxmxnubxjezkwbbxdr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ';

// 使用 window.supabase 并给独立客户端命名，防止变量冲突
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

let currentProductId = null; // 当前管理的商品 ID
let currentProductData = null; // 当前商品数据缓存

// 页面加载完成后自动触发
document.addEventListener('DOMContentLoaded', fetchProducts);

// ==========================================
// 2. 从数据库获取商品列表并渲染
// ==========================================
async function fetchProducts() {
    if (!supabaseClient) {
        alert('Supabase SDK 加载失败，请检查 HTML 中是否正确引入了 Supabase CDN！');
        return;
    }

    const { data, error } = await supabaseClient.from('products').select('*');
    if (error) {
        alert('获取商品失败：' + error.message);
        return;
    }
    renderProductList(data);
}

// 渲染商品表格
function renderProductList(products) {
    const tbody = document.getElementById('image-product-list');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">暂无商品数据</td></tr>';
        return;
    }

    products.forEach(product => {
        const tr = document.createElement('tr');
        // 🎯 列表封面图优先读取 product.image (即你的主图1)
        const coverImg = product.image || 'https://via.placeholder.com/50?text=无图';

        tr.innerHTML = `
            <td>
                <img src="${coverImg}" onerror="this.src='https://via.placeholder.com/50?text=无图'" class="table-thumb">
            </td>
            <td><strong>${product.name || '未命名商品'}</strong></td>
            <td>
                <button class="btn-manage" onclick="showImageDetail(${product.id})">🖼️ 管理图片</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================
// 3. 进入单个商品的图片管理详情页
// ==========================================
async function showImageDetail(productId) {
    currentProductId = productId;
    
    // 查询当前商品最新数据
    const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

    if (error) {
        alert('加载商品图片失败: ' + error.message);
        return;
    }

    currentProductData = data;
    document.getElementById('current-product-name').innerText = data.name || '商品详情';

    // 🎯 核心逻辑：把 image, image2, image3, image4 四个列的数据拼成主图数组
    const mainImagesList = [
        data.image,
        data.image2,
        data.image3,
        data.image4
    ].filter(url => url && typeof url === 'string' && url.trim() !== '');

    // 渲染主图网格和详情图网格
    renderImages('main', mainImagesList);
    renderImages('detail', data.detail_images || []);

    // 切换界面显示
    document.getElementById('product-box').style.display = 'none';
    document.getElementById('image-detail-box').style.display = 'block';
}

// 渲染图片网格 (带勾选框)
function renderImages(type, imgUrls) {
    const container = document.getElementById(type === 'main' ? 'main-images' : 'detail-images');
    if (!container) return;
    container.innerHTML = '';

    if (!imgUrls || imgUrls.length === 0) {
        container.innerHTML = `<div class="empty-tip">暂无图片，请点击右上角批量上传</div>`;
        return;
    }

    imgUrls.forEach((url, index) => {
        const card = document.createElement('div');
        card.className = 'img-card';
        card.innerHTML = `
            <label class="checkbox-container">
                <input type="checkbox" class="img-select-${type}" value="${url}">
                <span class="checkmark"></span>
            </label>
            <img src="${url}" alt="图片">
            <div class="img-index">#${index + 1}</div>
        `;
        container.appendChild(card);
    });
}

// 触发隐藏的文件选择器
function triggerUpload(type) {
    const input = document.getElementById(type === 'main' ? 'upload-main-input' : 'upload-detail-input');
    if (input) input.click();
}

// ==========================================
// 4. 核心功能：批量上传图片处理
// ==========================================
async function handleBatchUpload(event, type) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    alert(`正在上传 ${files.length} 张图片，请稍候...`);

    const uploadedUrls = [];

    for (let file of files) {
        // 生成唯一文件名防止覆盖
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${file.name}`;
        
        // 1. 上传至 Storage (Bucket 名: product-images)
        const { error } = await supabaseClient.storage
            .from('product-images')
            .upload(fileName, file);

        if (error) {
            console.error('单张图片上传失败:', error);
            continue;
        }

        // 2. 获取公开访问外链
        const { data: publicUrlData } = supabaseClient.storage
            .from('product-images')
            .getPublicUrl(fileName);

        if (publicUrlData && publicUrlData.publicUrl) {
            uploadedUrls.push(publicUrlData.publicUrl);
        }
    }

    if (uploadedUrls.length > 0) {
        let updateData = {};

        if (type === 'main') {
            // 🎯 主图上传逻辑：填补 image, image2, image3, image4 的空位
            const mainKeys = ['image', 'image2', 'image3', 'image4'];
            let urlIdx = 0;

            for (let key of mainKeys) {
                if (!currentProductData[key] && urlIdx < uploadedUrls.length) {
                    updateData[key] = uploadedUrls[urlIdx];
                    currentProductData[key] = uploadedUrls[urlIdx];
                    urlIdx++;
                }
            }

            if (Object.keys(updateData).length === 0) {
                alert('主图（image~image4）最多只能保存 4 张，请先删除部分主图再试！');
                event.target.value = '';
                return;
            }
        } else {
            // 🎯 详情图上传逻辑：追加到 detail_images 数组
            const updatedImages = [...(currentProductData.detail_images || []), ...uploadedUrls];
            updateData = { detail_images: updatedImages };
            currentProductData.detail_images = updatedImages;
        }

        // 3. 更新数据库
        const { error: dbError } = await supabaseClient
            .from('products')
            .update(updateData)
            .eq('id', currentProductId);

        if (!dbError) {
            showImageDetail(currentProductId); // 重新加载页面数据
            alert(`成功上传 ${uploadedUrls.length} 张图片！`);
        } else {
            alert('数据库更新失败：' + dbError.message);
        }
    } else {
        alert('图片上传失败，请检查 Supabase Storage 权限配置。');
    }
    
    event.target.value = ''; // 重置 input 框状态
}

// ==========================================
// 5. 核心功能：批量删除图片处理
// ==========================================
async function handleBatchDelete(type) {
    const checkboxes = document.querySelectorAll(`.img-select-${type}:checked`);
    const selectedUrls = Array.from(checkboxes).map(cb => cb.value);

    if (selectedUrls.length === 0) {
        alert('请先勾选需要删除的图片！');
        return;
    }

    if (!confirm(`确定要彻底删除选中的 ${selectedUrls.length} 张图片吗？`)) {
        return;
    }

    let updateData = {};

    if (type === 'main') {
        // 🎯 主图删除逻辑：清空选中的 image, image2, image3, image4 对应字段
        const mainKeys = ['image', 'image2', 'image3', 'image4'];
        
        mainKeys.forEach(key => {
            if (selectedUrls.includes(currentProductData[key])) {
                updateData[key] = null; // 设置为空
                currentProductData[key] = null;
            }
        });
    } else {
        // 🎯 详情图删除逻辑：从 detail_images 数组中剔除
        const remainingImages = (currentProductData.detail_images || []).filter(
            url => !selectedUrls.includes(url)
        );
        updateData = { detail_images: remainingImages };
        currentProductData.detail_images = remainingImages;
    }

    // 1. 更新数据库
    const { error } = await supabaseClient
        .from('products')
        .update(updateData)
        .eq('id', currentProductId);

    if (error) {
        alert('删除失败：' + error.message);
        return;
    }

    // 2. 从 Storage 中物理删除文件（可选）
    for (let url of selectedUrls) {
        const filePath = url.split('/product-images/')[1];
        if (filePath) {
            await supabaseClient.storage.from('product-images').remove([filePath]);
        }
    }

    // 重新渲染视图
    showImageDetail(currentProductId);
    alert('批量删除成功！');
}

// ==========================================
// 6. 返回商品列表
// ==========================================
function backProducts() {
    document.getElementById('image-detail-box').style.display = 'none';
    document.getElementById('product-box').style.display = 'block';
    fetchProducts();
}
