// =========================
// Supabase配置
// =========================


const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";



const client =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);





// =========================
// 商品数据
// =========================


let allProducts = [];




// =========================
// 加载商品
// =========================


async function loadProducts(){


const box =
document.getElementById(
"product-list"
);



box.innerHTML =
"Loading products...";




const {

data,

error

}= await client


.from("products")


.select("*")


.eq(
"stock_status",
"上架"
)


.order(
"id",
{
ascending:false
}
);





if(error){


console.log(error);



box.innerHTML =
"Products loading failed";


return;


}





allProducts = data;



showProducts(
allProducts
);



}









// =========================
// 显示商品
// =========================


function showProducts(list){



const box =
document.getElementById(
"product-list"
);



let html = "";





if(list.length===0){


box.innerHTML =

"<h3>No products found</h3>";

return;


}







list.forEach(item=>{



html += `


<div class="card">





<img

src="${item.image || ''}"

alt="${item.name_en || item.name}"

>







<h3>

${item.name_en || item.name}

</h3>







<p class="category">

${item.category || "Chinese Products"}

</p>







<p class="desc">

${item.description_en || ""}

</p>







<p class="price">

$${item.price || 0}

</p>







<a

href="${item.ebay_url || '#'}"

target="_blank">


<button

class="buy-btn"

>

Buy on eBay

</button>


</a>





</div>


`;



});






box.innerHTML = html;



}









// =========================
// 分类筛选
// =========================


function filterProducts(category){



if(category==="全部"){


showProducts(
allProducts
);


return;


}




const result =


allProducts.filter(item=>


item.category === category


);



showProducts(
result
);



}









// =========================
// 搜索商品
// =========================


function searchProducts(){



const key =


document

.getElementById("search")

.value

.trim()

.toLowerCase();






const result =


allProducts.filter(item=>{



return (


(item.name &&

item.name.toLowerCase()

.includes(key))


||



(item.name_en &&

item.name_en.toLowerCase()

.includes(key))


||



(item.category &&

item.category.toLowerCase()

.includes(key))


);



});






showProducts(
result
);



}









// =========================
// 初始化
// =========================


loadProducts();
