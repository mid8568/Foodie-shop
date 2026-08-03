console.log("admin-products.js 启动成功");

// =======================
// Supabase 初始化
// =======================
const SUPABASE_URL = "https://ukxxmxnubxjezkwbbxdr.supabase.co";
const SUPABASE_KEY = "sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =======================
// 全局状态管理
// =======================
const PAGE_SIZE = 15;
let currentPage = 1;
let totalPages = 1;
let totalCount = 0;

// 多条件筛选参数
let filterParams = {
    keywordTitle: "", // 商品标题
    keywordId: "",    // 商品ID
    keywordCode: "",  // 商家编码
    statusTab: "出售中"  // 默认同 HTML HTML 一致为 "出售中"
};

// =======================
// 工具函数 (转义 HTML，防止 XSS 和属性破裂)
// =======================
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// =======================
// 页面加载绑定
// =======================
document.addEventListener("DOMContentLoaded", () => {
    // 1. 初始化Tab切换事件
    initTabs();
    
    // 2. 加载商品列表数据
    loadProducts();
});

// 初始化顶部 Tab 逻辑
function initTabs() {
    const tabs = document.querySelectorAll(".tabs .tab-item");
    tabs.forEach(tab => {
        tab.addEventListener("click", function() {
            tabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            
            // 提取 Tab 名称 (去掉后面的数字，如 "出售中(10)" -> "出售中")
            const tabName = this.innerText.split('(')[0].trim();
            filterParams.statusTab = tabName;
            
            // 切 Tab 时重置到第一页并重新加载
            loadProducts(1);
        });
    });
}

// =======================
// 加载与查询商品
// =======================
async function loadProducts(page = 1) {
    currentPage = page;
    let start = (page - 1) * PAGE_SIZE;
    let end = start + PAGE_SIZE - 1;

    // 构建 Supabase 基础查询
    let query = supabaseClient
        .from("products")
        .select("*", { count: "exact" })
        .order("id", { ascending: false })
        .range(start, end);

    // 1. 根据 Tab 过滤上/下架状态
    if (filterParams.statusTab === "出售中") {
        query = query.eq("stock_status", "上架");
    } else if (filterParams.statusTab === "仓库中") {
        query = query.eq("stock_status", "下架");
    }

    // 2. 组合框筛选：商品标题
    if (filterParams.keywordTitle) {
        query = query.ilike("name", `%${filterParams.keywordTitle}%`);
    }

    // 3. 组合框筛选：商品ID (支持逗号/空格分隔多个ID)
    if (filterParams.keywordId) {
        const ids = filterParams.keywordId
            .split(/[,，\s]+/)
            .map(id => id.trim())
            .filter(id => id);
        if (ids.length > 0) {
            query = query.in("id", ids);
        }
    }

    // 4. 组合框筛选：商家编码
    if (filterParams.keywordCode) {
        query = query.ilike("merchant_code", `%${filterParams.keywordCode}%`);
    }

    const { data, count, error } = await query;

    if (error) {
        console.error("加载商品失败:", error);
        
        // 界面错误兜底处理
        const box = document.getElementById("product-list");
        if (box) {
            box.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red; padding: 20px;">数据加载失败，请检查数据库配置或网络连接！</td></tr>`;
        }
        totalCount = 0;
        totalPages = 1;
        renderPaginationInfo();
        return;
    }

    totalCount = count || 0;
    totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

    // 渲染表格与分页状态
    renderProducts(data || []);
    renderPaginationInfo();
}

// =======================
// 商品列表渲染
// =======================
function renderProducts(products) {
    const box = document.getElementById("product-list");
    if (!box) return;

    box.innerHTML = "";

    if (!products || products.length === 0) {
        box.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#999; padding: 20px;">暂无满足条件的商品数据</td></tr>`;
        return;
    }

    products.forEach(item => {
        let tr = document.createElement("tr");

        // 状态文字与样式
        const isOnline = item.stock_status === "上架";
        const statusClass = isOnline ? "status-tag" : "status-tag offline";
        const statusText = item.stock_status || "下架";

        // 格式化时间
        const createTime = item.created_at 
            ? new Date(item.created_at).toLocaleString('zh-CN', { hour12: false }) 
            : '-';

        const safeName = escapeHtml(item.name || "未命名商品");
        const safeNameEn = escapeHtml(item.name_en || "-");
        const url1688 = item['1688_url'] ? escapeHtml(item['1688_url']) : '';

        // 拼接 HTML <td>
        tr.innerHTML = `
            <!-- 1. 选择框 -->
            <td width="30">
                <input type="checkbox" class="select-item" value="${item.id}">
            </td>

            <!-- 2. 图片 -->
            <td width="70">
                <img src="${escapeHtml(item.image) || 'https://via.placeholder.com/50'}" class="table-image" alt="商品图">
            </td>

            <!-- 3. 中文标题 -->
            <td class="product-name">
                <div title="${safeName}">${safeName}</div>
                <div style="color: #999; font-size: 12px; margin-top: 4px;">ID: ${item.id}</div>
                ${url1688 ? `<a href="${url1688}" target="_blank" class="link-1688">1688链接</a>` : ''}
            </td>

            <!-- 4. 英文标题 -->
            <td class="product-name-en">
                <div title="${safeNameEn}">${safeNameEn}</div>
            </td>

            <!-- 5. 价格 (带有 ¥ 符号和实时编辑) -->
            <td>
                ¥ <input type="number" step="0.01" value="${item.price || 0}" id="price-${item.id}" class="edit-price" onblur="updateProductField('${item.id}')">
            </td>

            <!-- 6. 库存 (实时编辑) -->
            <td>
                <input type="number" value="${item.stock_quantity || 0}" id="stock-${item.id}" class="edit-stock" onblur="updateProductField('${item.id}')">
            </td>

            <!-- 7. 状态 (创建时间 + 上/下架状态) -->
            <td>
                <div style="font-size: 12px; color: #666; margin-bottom: 2px;">${createTime}</div>
                <span class="${statusClass}">${statusText}</span>
            </td>

            <!-- 8. 操作 -->
            <td class="action-links">
                <a href="javascript:void(0)" onclick="editProduct('${item.id}')">编辑商品</a><br>
                <a href="javascript:void(0)" onclick="toggleStatus('${item.id}', '${item.stock_status}')">${isOnline ? '下架商品' : '上架商品'}</a>
            </td>
        `;

        box.appendChild(tr);
    });
}

// =======================
// 搜索与重置
// =======================
function searchProduct() {
    const inputTitle = document.getElementById("search-title")?.value.trim() || "";
    const inputId = document.getElementById("search-id")?.value.trim() || "";
    const inputCode = document.getElementById("search-code")?.value.trim() || "";

    filterParams.keywordTitle = inputTitle;
    filterParams.keywordId = inputId;
    filterParams.keywordCode = inputCode;

    loadProducts(1);
}

function resetSearch() {
    if (document.getElementById("search-title")) document.getElementById("search-title").value = "";
    if (document.getElementById("search-id")) document.getElementById("search-id").value = "";
    if (document.getElementById("search-code")) document.getElementById("search-code").value = "";

    filterParams.keywordTitle = "";
    filterParams.keywordId = "";
    filterParams.keywordCode = "";

    loadProducts(1);
}

// =======================
// 字段即时更新 (价格/库存)
// =======================
async function updateProductField(id) {
    let priceInput = document.getElementById("price-" + id);
    let stockInput = document.getElementById("stock-" + id);

    if (!priceInput || !stockInput) return;

    let price = Number(priceInput.value);
    let stock = Number(stockInput.value);

    const { error } = await supabaseClient
        .from("products")
        .update({
            price: price,
            stock_quantity: stock
        })
        .eq("id", id);

    if (error) {
        console.error("保存失败:", error);
        alert("实时修改价格/库存失败，请确认是否有权限！");
        return;
    }

    console.log("实时修改成功, 商品ID:", id);
}

// =======================
// 快捷上下架切换
// =======================
async function toggleStatus(id, currentStatus) {
    let newStatus = currentStatus === "上架" ? "下架" : "上架";

    const { error } = await supabaseClient
        .from("products")
        .update({
            stock_status: newStatus
        })
        .eq("id", id);

    if (error) {
        console.error("切换状态失败:", error);
        alert("切换状态失败");
        return;
    }

    // 重新刷新列表数据
    loadProducts(currentPage);
}

// =======================
// 操作响应 (编辑/添加/批量全选)
// =======================
function editProduct(id) {
    if (window.parent && window.parent.openPage) {
        window.parent.openPage("edit", id);
    } else {
        window.location.href = "admin.html?page=edit&id=" + id;
    }
}

function addProduct() {
    if (window.parent && window.parent.openPage) {
        window.parent.openPage("add-product");
    } else {
        alert("跳转至发布商品页面");
    }
}

// 全选/反选实现
function toggleSelectAll(masterCheckbox) {
    const checkboxes = document.querySelectorAll(".select-item");
    checkboxes.forEach(cb => cb.checked = masterCheckbox.checked);
}

// =======================
// 分页控件及交互逻辑
// =======================
function renderPaginationInfo() {
    // 支持兼容查找 page-info 或 pagination 容器
    const infoBox = document.getElementById("page-info") || document.getElementById("pagination");
    if (!infoBox) {
        console.warn("⚠️ 注意：未在 HTML 中找到分页容器！");
        return;
    }

    // 切页时重置主全选复选框（如果存在）
    const masterCb = document.getElementById("select-all");
    if (masterCb) masterCb.checked = false;

    // 拼接分页 UI HTML
    infoBox.innerHTML = `
        <span style="margin-right: 10px; color: #666;">
            共 <strong>${totalCount}</strong> 件商品
        </span>
        <button class="btn-page" onclick="changePage(${currentPage - 1})" ${currentPage <= 1 ? "disabled" : ""}>&lt; 上一页</button>
        <span style="margin: 0 8px; font-weight: bold;">${currentPage} / ${totalPages}</span>
        <button class="btn-page" onclick="changePage(${currentPage + 1})" ${currentPage >= totalPages ? "disabled" : ""}>下一页 &gt;</button>
        
        <span style="margin-left: 12px; color: #666;">
            跳转至 <input type="number" id="jump-page-input" min="1" max="${totalPages}" value="${currentPage}" style="width: 45px; text-align: center; height: 26px; border: 1px solid #ccc; border-radius: 3px; outline: none;"> 页
            <button class="btn-page" onclick="jumpToPage()" style="margin-left: 4px;">GO</button>
        </span>
    `;
}

function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    loadProducts(page);
}

function jumpToPage() {
    const input = document.getElementById("jump-page-input");
    if (!input) return;

    let targetPage = parseInt(input.value, 10);
    if (isNaN(targetPage)) return;

    if (targetPage < 1) targetPage = 1;
    if (targetPage > totalPages) targetPage = totalPages;

    changePage(targetPage);
}

// =======================
// 导出给 HTML 全局调用
// =======================
window.loadProducts = loadProducts;
window.searchProduct = searchProduct;
window.resetSearch = resetSearch;
window.addProduct = addProduct;
window.editProduct = editProduct;
window.toggleStatus = toggleStatus;
window.updateProductField = updateProductField;
window.changePage = changePage;
window.jumpToPage = jumpToPage;
window.toggleSelectAll = toggleSelectAll;
