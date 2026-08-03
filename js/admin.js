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

        // 图片管理
        case "images":
            url = "admin-images.html";
            break;

        // 商品编辑
        case "edit":
            if (id) {
                url = "admin-edit.html?id=" + id;
            } else {
                url = "admin-products.html";
            }
            break;

        // 前端装修
        case "decorate":
            url = "admin-decorate.html";
            break;

        // eBay同步
        case "ebay":
            url = "admin-ebay.html";
            break;

        default:
            url = "admin-products.html";
    }

    frame.src = url;

    // 更新左侧菜单高亮状态
    updateSidebarActive(page);
}

// 高亮当前选中的左侧菜单
function updateSidebarActive(page) {
    const links = document.querySelectorAll(".sidebar a");
    links.forEach(a => {
        // 判断 onclick 属性中是否包含当前 page 名称
        if (a.getAttribute("onclick") && a.getAttribute("onclick").includes(`'${page}'`)) {
            a.classList.add("active");
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
// 浏览器前进后退
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

window.editProduct = function(id) {
    openPage("edit", id);
};
