console.log("前台 app.js 启动");

// Supabase 初始化配置（使用您后台提供的配置）
const SUPABASE_URL = "https://ukxxmxnubxjezkwbbxdr.supabase.co";
const SUPABASE_KEY = "sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", () => {
    initHomePage();
});

/**
 * 首页数据初始化
 */
async function initHomePage() {
    const container = document.getElementById("home-container");
    if (!container) return;

    try {
        // 1. 并行读取装修配置与所有的商品列表，提高加载效率
        const [decorations, productsMap] = await Promise.all([
            fetchDecorations(),
            fetchAllProductsMap()
        ]);

        if (!decorations || decorations.length === 0) {
            container.innerHTML = '<div class="loading">暂无首页装修内容</div>';
            return;
        }

        // 清空加载中提示
        container.innerHTML = "";

        // 2. 遍历渲染各个装修模块
        decorations.forEach(item => {
            const sectionDom = createSectionNode(item, productsMap);
            if (sectionDom) {
                container.appendChild(sectionDom);
            }
        });

    } catch (err) {
        console.error("加载首页装修失败:", err);
        container.innerHTML = '<div class="loading">页面加载失败，请稍后再试</div>';
    }
}

/**
 * 从 Supabase 读取生效的装修模块（升序排列，过滤启用状态）
 */
async function fetchDecorations() {
    const { data, error } = await supabaseClient
        .from("decorations")
        .select("*")
        .eq("status", true) // 仅读取已开启的模块
        .order("sort_order", { ascending: true });

    if (error) {
        console.error("fetchDecorations Error:", error);
        return [];
    }
    return data || [];
}

/**
 * 获取商品列表并转化成 Map（方便通过 ID 直接取商品详情）
 */
async function fetchAllProductsMap() {
    const { data, error } = await supabaseClient
        .from("products")
        .select("id, name, image, price, sale_price, currency");

    if (error) {
        console.error("fetchAllProducts Error:", error);
        return new Map();
    }

    const map = new Map();
    (data || []).forEach(prod => {
        map.set(prod.id, prod);
    });
    return map;
}

/**
 * 根据模块类型构建对应的 DOM 节点
 */
function createSectionNode(item, productsMap) {
    let content = item.content || {};

    // 兼容可能被存为 JSON 字符串的 content 结构
    if (typeof content === "string") {
        try {
            content = JSON.parse(content);
        } catch (e) {
            content = {};
        }
    }

    const section = document.createElement("section");
    section.className = `decoration-section ${item.type}-section`;

    // 1. Banner 模块渲染
    if (item.type === "banner") {
        if (!content.image) return null; // 无图片则跳过

        const img = document.createElement("img");
        img.src = content.image;
        img.alt = item.title || "Banner";

        if (content.url) {
            const link = document.createElement("a");
            link.href = content.url;
            link.appendChild(img);
            section.appendChild(link);
        } else {
            section.appendChild(img);
        }
        return section;
    }

    // 2. 公告模块渲染
    if (item.type === "notice") {
        if (!content.text) return null; // 无内容则跳过

        section.innerText = content.text;
        return section;
    }

    // 3. 推荐商品模块渲染
    if (item.type === "products") {
        const productIds = content.product_ids || [];
        if (productIds.length === 0) return null;

        // 模块标题
        if (item.title) {
            const h3 = document.createElement("h3");
            h3.className = "section-title";
            h3.innerText = item.title;
            section.appendChild(h3);
        }

        // 商品 Grid 容器
        const grid = document.createElement("div");
        grid.className = "products-grid";

        let hasProduct = false;
        productIds.forEach(id => {
            const product = productsMap.get(id);
            if (product) {
                hasProduct = true;
                const card = document.createElement("div");
                card.className = "product-card";
                card.innerHTML = `
                     <img src="${product.image || ''}" alt="${product.name}">
                     <div class="title">${product.name}</div>
                     <div class="price">
                     ${product.currency || "$"}${product.sale_price || product.price || 0}
                     </div>
                      `;
                grid.appendChild(card);
            }
        });

        if (!hasProduct) return null;

        section.appendChild(grid);
        return section;
    }

    return null;
}
