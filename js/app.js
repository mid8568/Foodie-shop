/* ==========================================
 * 1. FB 风格头像交互逻辑 (查看/更换头像)
 * ========================================== */

// 切换显示 / 隐藏头像下拉菜单
function toggleAvatarMenu(event) {
    event.stopPropagation(); // 阻止点击冒泡
    const dropdown = document.getElementById('avatarDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// 点击页面其它任意地方时，自动关闭弹窗菜单
document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('avatarDropdown');
    const avatarBtn = document.getElementById('avatarBtn');
    if (dropdown && avatarBtn && !avatarBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// 查看头像：在新页面打开大图预览
function viewAvatar() {
    const logoImg = document.getElementById('site-logo').src;
    window.open(logoImg, '_blank');
    closeAvatarMenu();
}

// 选择头像：触发隐藏的 input[type="file"] 上传窗口
function triggerAvatarUpload() {
    const fileInput = document.getElementById('avatarInput');
    if (fileInput) {
        fileInput.click();
    }
    closeAvatarMenu();
}

// 预览并更换选中的本地图片
function uploadNewAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // 将头像 src 替换为选中的本地图片 BASE64 预览数据
            document.getElementById('site-logo').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// 辅助函数：关闭菜单
function closeAvatarMenu() {
    const dropdown = document.getElementById('avatarDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

/* ==========================================
 * 2. 商品搜索与筛选逻辑 (基础示例)
 * ========================================== */

// 简易搜索商品示例
function searchProducts() {
    const query = document.getElementById('search').value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card, .card');

    productCards.forEach(card => {
        const title = card.querySelector('h3') ? card.querySelector('h3').innerText.toLowerCase() : '';
        if (title.includes(query)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// 简易分类筛选示例
function filterProducts(category) {
    console.log("Filtering category:", category);
    // 这里如果连接了 Supabase，可以在这里请求不同 category 的数据并渲染
}
