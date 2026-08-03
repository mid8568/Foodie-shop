console.log("admin.js启动");

// =======================
// 页面初始化
// =======================
document.addEventListener("DOMContentLoaded", () => {
    let params = new URLSearchParams(window.location.search);
    let page = params.get("page") || "products";
    let id = params.get("id") || "";

    loadPage(page, id);
});

// =======================
// 加载后台模块
// =======================
function loadPage(page, id = "") {
    let frame = document.getElementById("module-frame");

    if (!frame) {
        console.error("找不到 module-frame");
        return;
    }

    let url = "";

    switch (page) {
        case "home":
            url = "admin-home.html";
            break;

        // 商品管理
        case "products":
            url = "admin-products.html";
            break;

        // 图片管理（拆分为产品和装修）
        case "images-product":
            url = "admin-images.html";
            break;

        case "images-decor":
            url = "admin-images-decor.html";
            break;

        // 商品编辑
        case "edit":
            if (id) {
                url = "admin-edit.html?id=" + id;
            } else {
                url = "admin-products.html";
            }
            break;

        // 前端装修（拆分为 PC 端和手机端）
        case "decor-pc":
            url = "admin-decoration.html";
            break;

        case "decor-mobile":
            url = "admin-decor-mobile.html";
            break;

        // eBay同步
        case "ebay":
            url = "admin-ebay.html";
            break;

        default:
            url = "admin-products.html";
    }

    frame.src = url;

    // 更新左侧菜单高亮及下拉菜单状态
    updateSidebarActive(page);
}

// 高亮当前选中的左侧菜单并自动展开父级菜单
function updateSidebarActive(page) {
    const links = document.querySelectorAll(".sidebar a");
    links.forEach(a => {
        const onClickAttr = a.getAttribute("onclick");
        if (onClickAttr && onClickAttr.includes(`'${page}'`)) {
            a.classList.add("active");

            // 如果当前激活的是子菜单，自动展开对应下拉框
            const parentDropdown = a.closest('.nav-dropdown');
            if (parentDropdown) {
                parentDropdown.classList.add('active');
                const container = parentDropdown.querySelector('.dropdown-container');
                if (container) {
                    container.style.maxHeight = container.scrollHeight + "px";
                }
            }
        } else {
            a.classList.remove("active");
        }
    });
}

// =======================
// 菜单跳转
// =======================
function openPage(page, id = "") {
    let url = "admin.html?page=" + page;

    if (id) {
        url += "&id=" + id;
    }

    history.pushState(null, "", url);
    loadPage(page, id);
}

// =======================
// 下拉菜单控制
// =======================
function toggleDropdown(element) {
    const parentDropdown = element.parentElement;
    const container = parentDropdown.querySelector('.dropdown-container');

    parentDropdown.classList.toggle('active');

    if (parentDropdown.classList.contains('active')) {
        container.style.maxHeight = container.scrollHeight + 'px';
    } else {
        container.style.maxHeight = '0px';
    }
}

// =======================
// 浏览器前进后退监听
// =======================
window.addEventListener("popstate", () => {
    let params = new URLSearchParams(window.location.search);
    let page = params.get("page") || "products";
    let id = params.get("id") || "";

    loadPage(page, id);
});

// =======================
// 暴露全局方法
// =======================
window.openPage = openPage;
window.toggleDropdown = toggleDropdown;

window.editProduct = function(id) {
    openPage("edit", id);
};
