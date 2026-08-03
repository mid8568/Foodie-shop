// 1. 初始化 Supabase 客户端 (请替换为你的 URL 和 Key)
const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentProductId = null; // 当前正在管理的商品 ID
let currentProductData = null; // 当前商品数据

// 初始化页面
document.addEventListener('DOMContentLoaded', fetchProducts);

// 从数据库获取商品列表
async function fetchProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
        alert('获取商品失败：' + error.message);
        return;
    }
    renderProductList(data);
}

// 渲染商品列表
function renderProductList(products) {
    const tbody = document.getElementById('image-product-list');
    tbody.innerHTML = '';

    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${product.cover_url || 'images/default.jpg'}" class="table-thumb"></td>
            <td><strong>${product.name}</strong></td>
            <td>
                <button class="btn-manage" onclick="showImageDetail(${product.id})">🖼️ 管理图片</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 进入图片管理详情页
async function showImageDetail(productId) {
    currentProductId = productId;
    
    // 查询当前商品最新的图片数组
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

    if (error) {
        alert('加载商品图片失败');
        return;
    }

    currentProductData = data;
    document.getElementById('current-product-name').innerText = data.name;

    // 渲染主图与详情图
    renderImages('main', data.main_images || []);
    renderImages('detail', data.detail_images || []);

    document.getElementById('product-box').style.display = 'none';
    document.getElementById('image-detail-box').style.display = 'block';
}

// 渲染图片网格 (带勾选框)
function renderImages(type, imgUrls) {
    const container = document.getElementById(type === 'main' ? 'main-images' : 'detail-images');
    container.innerHTML = '';

    if (imgUrls.length === 0) {
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

// 触发隐藏的上传 Input
function triggerUpload(type) {
    document.getElementById(type === 'main' ? 'upload-main-input' : 'upload-detail-input').click();
}

// ==========================================
// 🚀 核心 1：批量上传图片处理
// ==========================================
async function handleBatchUpload(event, type) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // 提示进度
    alert(`正在上传 ${files.length} 张图片，请稍候...`);

    const uploadedUrls = [];

    for (let file of files) {
        // 生成唯一文件名防止覆盖
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${file.name}`;
        
        // 1. 上传至 Supabase Storage (假设 bucket 名称为 product-images)
        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

        if (error) {
            console.error('单张图片上传失败:', error);
            continue;
        }

        // 2. 获取公开访问链接
        const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

        uploadedUrls.push(publicUrlData.publicUrl);
    }

    if (uploadedUrls.length > 0) {
        // 3. 更新数据库中的图片数组
        const fieldName = type === 'main' ? 'main_images' : 'detail_images';
        const updatedImages = [...(currentProductData[fieldName] || []), ...uploadedUrls];

        const { error: dbError } = await supabase
            .from('products')
            .update({ [fieldName]: updatedImages })
            .eq('id', currentProductId);

        if (!dbError) {
            currentProductData[fieldName] = updatedImages;
            renderImages(type, updatedImages);
            alert(`成功批量上传 ${uploadedUrls.length} 张图片！`);
        } else {
            alert('数据库更新失败：' + dbError.message);
        }
    }
    
    // 清空 input 状态
    event.target.value = '';
}

// ==========================================
// 🚀 核心 2：批量删除图片处理
// ==========================================
async function handleBatchDelete(type) {
    // 获取所有被勾选的图片 URL
    const checkboxes = document.querySelectorAll(`.img-select-${type}:checked`);
    const selectedUrls = Array.from(checkboxes).map(cb => cb.value);

    if (selectedUrls.length === 0) {
        alert('请先勾选需要删除的图片！');
        return;
    }

    if (!confirm(`确定要彻底删除选中的 ${selectedUrls.length} 张图片吗？`)) {
        return;
    }

    const fieldName = type === 'main' ? 'main_images' : 'detail_images';
    
    // 1. 过滤掉选中的图片，保留剩余图片
    const remainingImages = (currentProductData[fieldName] || []).filter(
        url => !selectedUrls.includes(url)
    );

    // 2. 更新数据库
    const { error } = await supabase
        .from('products')
        .update({ [fieldName]: remainingImages })
        .eq('id', currentProductId);

    if (error) {
        alert('删除失败：' + error.message);
        return;
    }

    // 3. (可选) 从 Storage 中移除文件物理存储
    for (let url of selectedUrls) {
        const filePath = url.split('/product-images/')[1];
        if (filePath) {
            await supabase.storage.from('product-images').remove([filePath]);
        }
    }

    // 更新本地内存并重新渲染页面
    currentProductData[fieldName] = remainingImages;
    renderImages(type, remainingImages);
    alert('批量删除成功！');
}

// 返回商品列表
function backProducts() {
    document.getElementById('image-detail-box').style.display = 'none';
    document.getElementById('product-box').style.display = 'block';
    fetchProducts(); // 刷新列表
}
