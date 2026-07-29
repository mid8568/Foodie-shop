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




let allProducts=[];




// =========================
// 加载商品
// =========================

async function loadProducts(){


document.getElementById(
"product-list"
).innerHTML=
"Loading products...";



const {data,error}=await client

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


document.getElementById(
"product-list"
).innerHTML=
"Load failed";


return;

}



allProducts=data;


showProducts(
allProducts
);


}






// =========================
// 显示商品
// =========================

function showProducts(list){


let html="";



if(list.length===0){


document.getElementById(
"product-list"
).innerHTML=
"<h3>No products</h3>";


return;

}



list.forEach(item=>{



html+=`

<div class="card">



<img src="${item.image || ''}">



<h3>

${item.name_en || item.name}

</h3>




<p class="category">

${item.category || "Chinese Products"}

</p>





<p class="desc">

${item.description_en || item.description || ""}

</p>





<p class="price">

$${item.price || 0}

</p>





<a href="product.html?id=${item.id}">

<button>

View Details

</button>

</a>





${
item.ebay_url
?
`
<a 
href="${item.ebay_url}"
target="_blank">

<button class="buy-btn">

Buy on eBay

</button>

</a>
`
:
""
}



</div>


`;



});




document.getElementById(
"product-list"
).innerHTML=html;


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

allProducts.filter(

item=>

item.category===category

);



showProducts(
result
);


}








// =========================
// 搜索
// =========================


function searchProducts(){



const key =

document.getElementById(
"search"
).value.trim()
.toLowerCase();




const result =

allProducts.filter(

item=>


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



showProducts(
result
);


}








// =========================
// 价格排序
// =========================


function sortPrice(type){



let result=[...allProducts];



if(type==="low"){


result.sort(

(a,b)=>

a.price-b.price

);


}



if(type==="high"){


result.sort(

(a,b)=>

b.price-a.price

);


}



showProducts(
result
);


}






// =========================
// 启动
// =========================

loadProducts();
