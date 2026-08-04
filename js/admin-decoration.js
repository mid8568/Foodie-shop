// ==========================================
// 1. Supabase 初始化
// ==========================================
const SUPABASE_URL = "https://ukxxmxnubxjezkwbbxdr.supabase.co";
const SUPABASE_KEY = "sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 全局状态管理
let currentModules = []; // 当前装修模块列表
let selectedModule = null; // 当前正在编辑的模块
let allProducts = []; // 商品库全局列表
let selectedProductIds = []; // 选中的商品 ID 数组

// ==========================================
// 2. DOM 元素获取
// ==========================================
const moduleTreeEl = document.getElementById("module-tree");
const formEdit = document.getElementById("form-module-edit");
const inputId = document.getElementById("edit-module-id");
const inputName = document.getElementById("edit-module-name");
const selectType = document.getElementById("edit-module-type");
const inputSort = document.getElementById("edit-module-sort");
const checkStatus = document.getElementById("edit-module-status");
const dynamicEditorEl = document.getElementById("dynamic-content-editor");
const btnDelete = document.getElementById("btn-delete-module");

// 弹窗元素
const modalProduct = document.getElementById("modal-product-select");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnConfirmProducts = document.getElementById("btn-confirm-products");
const productSelectListEl = document.getElementById("product-select-list");
const inputSearchProduct = document.getElementById("search-product-input");

// ==========================================
// 3. 核心功能：加载与渲染模块列表
// ==========================================
async function loadModules() {
  moduleTreeEl.innerHTML = '<div class="loading">加载中...</div>';

  const { data, error } = await supabase
    .from("decorations")
    .select("*")
    .order("sort", { ascending: true });

  if (error) {
    alert("加载首页模块失败: " + error.message);
    return;
  }

  currentModules = data || [];
  renderModuleList();

  // 默认选中第一个模块编辑
  if (currentModules.length > 0) {
    selectModuleForEdit(currentModules[0]);
  } else {
    resetEditForm();
  }
}

function renderModuleList() {
  if (currentModules.length === 0) {
    moduleTreeEl.innerHTML = '<p style="color:#888;">暂无装修模块，请新建</p>';
    return;
  }

  moduleTreeEl.innerHTML = currentModules
    .map((mod) => {
      const isActive = selectedModule && selectedModule.id === mod.id;
      return `
      <div class="module-item ${isActive ? "active" : ""}" onclick="handleSelectModule(${mod.id})">
        <div>
          <strong>${escapeHtml(mod.module_name)}</strong>
          <span class="module-tag">${mod.module_type}</span>
        </div>
        <small style="color:${mod.status ? "#10b981" : "#ef4444"}">
          ${mod.status ? "显示" : "隐藏"}
        </small>
      </div>
    `;
    })
    .join("");
}

window.handleSelectModule = function (id) {
  const mod = currentModules.find((m) => m.id === id);
  if (mod) selectModuleForEdit(mod);
};

// ==========================================
// 4. 动态解析并渲染编辑面板 (支持 JSONB)
// ==========================================
function selectModuleForEdit(mod) {
  selectedModule = mod;
  renderModuleList(); // 刷新高亮状态

  inputId.value = mod.id;
  inputName.value = mod.module_name;
  selectType.value = mod.module_type;
  inputSort.value = mod.sort || 0;
  checkStatus.checked = mod.status;

  renderDynamicEditor(mod.module_type, mod.content || {});
}

function renderDynamicEditor(type, content) {
  dynamicEditorEl.innerHTML = "";

  if (type === "product_section") {
    selectedProductIds = content.product_ids || [];
    dynamicEditorEl.innerHTML = `
      <div class="form-item">
        <label>模块展示标题 (Title)</label>
        <input type="text" id="json-title" value="${escapeHtml(content.title || "")}" placeholder="如：Featured Products" />
      </div>
      <div class="form-item">
        <label>关联推荐商品 (${selectedProductIds.length} 个已选择)</label>
        <button type="button" class="btn secondary" onclick="openProductModal()">选择商品</button>
        <div id="selected-products-preview" style="margin-top:10px; font-size:12px; color:#666;">
          ${selectedProductIds.length > 0 ? `已选 ID: ${selectedProductIds.join(", ")}` : "尚未选择商品"}
        </div>
      </div>
    `;
  } else if (type === "notice") {
    dynamicEditorEl.innerHTML = `
      <div class="form-item">
        <label>公告文案</label>
        <textarea id="json-text" rows="3">${escapeHtml(content.text || "")}</textarea>
      </div>
      <div class="form-item">
        <label>跳转链接 (选填)</label>
        <input type="text" id="json-link" value="${escapeHtml(content.link || "")}" placeholder="/promotions" />
      </div>
    `;
  } else if (type === "banner_grid") {
    dynamicEditorEl.innerHTML = `
      <p style="font-size:13px; color:#666;">海报广告模块通过 content JSON 直接配置，你可以稍后自由扩充。</p>
    `;
  }
}

// 获取当前动态组件里输入的 JSON 结构
function buildContentFromUI(type) {
  const content = selectedModule ? { ...selectedModule.content } : {};

  if (type === "product_section") {
    content.title = document.getElementById("json-title")?.value || "";
    content.product_ids = selectedProductIds;
  } else if (type === "notice") {
    content.text = document.getElementById("json-text")?.value || "";
    content.link = document.getElementById("json-link")?.value || "";
  }

  return content;
}

// ==========================================
// 5. 保存与删除逻辑 (保存到 Supabase)
// ==========================================
formEdit.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = inputId.value;
  const moduleName = inputName.value.trim();
  const moduleType = selectType.value;
  const sort = parseInt(inputSort.value) || 0;
  const status = checkStatus.checked;
  const content = buildContentFromUI(moduleType);

  if (!moduleName) {
    alert("请输入模块名称");
    return;
  }

  const payload = {
    module_name: moduleName,
    module_type: moduleType,
    sort: sort,
    status: status,
    content: content,
    updated_at: new Date().toISOString()
  };

  let res;
  if (id) {
    // 更新既有模块
    res = await supabase.from("decorations").update(payload).eq("id", id);
  } else {
    // 新增模块
    res = await supabase.from("decorations").insert([payload]);
  }

  if (res.error) {
    alert("保存失败: " + res.error.message);
  } else {
    alert("保存成功！");
    loadModules();
  }
});

btnDelete.addEventListener("click", async () => {
  const id = inputId.value;
  if (!id) return;

  if (confirm("确定要删除这个装修模块吗？此操作无法撤销。")) {
    const { error } = await supabase.from("decorations").delete().eq("id", id);
    if (error) {
      alert("删除失败: " + error.message);
    } else {
      alert("删除成功！");
      loadModules();
    }
  }
});

// 新建模块按钮
document.getElementById("btn-open-add").addEventListener("click", () => {
  selectedModule = null;
  inputId.value = "";
  inputName.value = "新首页模块";
  selectType.disabled = false;
  selectType.value = "product_section";
  inputSort.value = 0;
  checkStatus.checked = true;
  selectedProductIds = [];

  renderDynamicEditor("product_section", {});
});

selectType.addEventListener("change", (e) => {
  renderDynamicEditor(e.target.value, {});
});

// ==========================================
// 6. 商品选择弹窗逻辑 (绑定 products 表)
// ==========================================
window.openProductModal = async function () {
  modalProduct.classList.add("open");
  if (allProducts.length === 0) {
    productSelectListEl.innerHTML = "加载商品中...";
    const { data, error } = await supabase
      .from("products")
      .select("id, title, price, image");

    if (error) {
      productSelectListEl.innerHTML = "商品加载失败: " + error.message;
      return;
    }
    allProducts = data || [];
  }
  renderProductGrid(allProducts);
};

function renderProductGrid(products) {
  if (products.length === 0) {
    productSelectListEl.innerHTML = '<p style="grid-column:1/-1;">无符合条件商品</p>';
    return;
  }

  productSelectListEl.innerHTML = products
    .map((prod) => {
      const isSelected = selectedProductIds.includes(prod.id);
      return `
      <div class="product-card-select ${isSelected ? "selected" : ""}" onclick="toggleSelectProduct(${prod.id})">
        <img src="${prod.image || "https://via.placeholder.com/80"}" alt="" />
        <p style="font-size:12px; margin-top:5px; height:28px; overflow:hidden;">${escapeHtml(prod.title || "无标题")}</p>
        <small>$${prod.price || 0}</small>
      </div>
    `;
    })
    .join("");
}

window.toggleSelectProduct = function (id) {
  const index = selectedProductIds.indexOf(id);
  if (index > -1) {
    selectedProductIds.splice(index, 1);
  } else {
    selectedProductIds.push(id);
  }
  renderProductGrid(allProducts);
};

inputSearchProduct.addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = allProducts.filter((p) =>
    (p.title || "").toLowerCase().includes(keyword)
  );
  renderProductGrid(filtered);
});

btnCloseModal.addEventListener("click", () => modalProduct.classList.remove("open"));
btnConfirmProducts.addEventListener("click", () => {
  modalProduct.classList.remove("open");
  const preview = document.getElementById("selected-products-preview");
  if (preview) {
    preview.innerText = selectedProductIds.length > 0 ? `已选 ID: ${selectedProductIds.join(", ")}` : "尚未选择商品";
  }
});

// 工具函数：转义 HTML 字符串
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resetEditForm() {
  inputId.value = "";
  inputName.value = "";
  dynamicEditorEl.innerHTML = "";
}

// 首次加载
loadModules();
