console.log(
"admin-products.js启动"
);


// =======================
// Supabase
// =======================


const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";



const supabaseClient =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

// =======================
// 分页设置
// =======================

const PAGE_SIZE = 15;

let currentPage = 1;

let totalPages = 1;

let currentKeyword = "";


// =======================
// 页面加载
// =======================


document.addEventListener(
"DOMContentLoaded",
()=>{


loadProducts();


});






// =======================
// 加载商品
// =======================

async function loadProducts(
keyword="",
page=1
){


currentPage = page;

currentKeyword = keyword;



let start =
(page-1)*PAGE_SIZE;



let end =
start + PAGE_SIZE - 1;



let query =
supabaseClient
.from("products")
.select(
"*",
{
count:"exact"
}
)
.order(
"id",
{
ascending:false
}
)
.range(
start,
end
);



if(keyword){


query =
query.ilike(
"name",
"%"+keyword+"%"
);


}



const {

data,

count,

error

}=await query;



if(error){

console.log(error);

return;

}



totalPages =
Math.ceil(
count / PAGE_SIZE
);



renderProducts(data);


renderPagination();


}



// =======================
// 显示商品列表
// =======================


function renderProducts(products){



const box =
document.getElementById(
"product-list"
);



box.innerHTML="";




products.forEach(item=>{



let tr =
document.createElement(
"tr"
);



tr.innerHTML = `


<td>


<img

src="${item.image || ''}"

class="table-image"


>


</td>




<td class="product-name">


<div>
${item.name || ""}
</div>


<a 
href="${item['1688_url'] || '#'}"
target="_blank"
class="1688-link">

1688链接

</a>


</td>




<td class="product-name-en">

${item.name_en || ""}

</td>




<td>


<input

type="number"

value="${item.price || 0}"

class="edit-price"

id="price-${item.id}"

onblur="updateProductField('${item.id}')"


>


</td>



<td>


<input

type="number"

value="${item.stock_quantity || 0}"

class="edit-stock"

id="stock-${item.id}"

onblur="updateProductField('${item.id}')"


>


</td>


<td>


<button

onclick="toggleStatus(
'${item.id}',
'${item.stock_status}'
)"

>

${item.stock_status || "下架"}


</button>


</td>




<td>


<button

onclick="editProduct('${item.id}')"

>

编辑

</button>



</td>



`;



box.appendChild(tr);



});



}









// =======================
// 搜索
// =======================


function searchProduct(){



let keyword =

document.getElementById(
"search"
).value;



loadProducts(
keyword,
1
);



}









// =======================
// 编辑跳转
// =======================


function editProduct(id){



console.log(
"编辑商品:",
id
);



window.location.href =

"admin-edit.html?id="+id;



}









// =======================
// 添加商品
// =======================


function addProduct(){



alert(
"添加商品功能开发中"
);



}






// =======================
// 暴露给HTML
// =======================


window.editProduct =
editProduct;


window.searchProduct =
searchProduct;


window.addProduct =
addProduct;
window.toggleStatus =
toggleStatus;
window.updateProductField =
updateProductField;
// =======================
// 自动保存价格库存
// 点击空白处触发
// =======================


async function updateProductField(id){



let price =

document.getElementById(
"price-"+id
).value;



let stock =

document.getElementById(
"stock-"+id
).value;



const {

error

}=await supabaseClient

.from("products")

.update({

price:Number(price),

stock_quantity:Number(stock)

})

.eq(
"id",
id
);



if(error){

console.log(error);

alert(
"保存失败"
);

return;

}



console.log(
"商品价格库存已更新",
id
);



}
// =======================
// 切换上下架
// =======================


async function toggleStatus(
id,
status
){


let newStatus =
status==="上架"
?
"下架"
:
"上架";



const {

error

}=await supabaseClient

.from("products")

.update({

stock_status:newStatus

})

.eq(
"id",
id
);



if(error){

console.log(error);

alert(
"修改失败"
);

return;

}



loadProducts(
currentKeyword,
currentPage
);


}
// =======================
// 分页
// =======================


function renderPagination(){


const box =
document.getElementById(
"pagination"
);



if(!box){
return;
}



box.innerHTML="";



let html="";



html += `

<button

onclick="loadProducts('${currentKeyword}',${currentPage-1})"

${currentPage<=1?"disabled":""}

>

上一页

</button>

`;



for(
let i=1;
i<=totalPages;
i++
){


html += `

<button

onclick="loadProducts('${currentKeyword}',${i})"

class="${i===currentPage?'active':''}"

>

${i}

</button>

`;



}



html += `

<button

onclick="loadProducts('${currentKeyword}',${currentPage+1})"

${currentPage>=totalPages?"disabled":""}

>

下一页

</button>

`;



box.innerHTML = html;


}



window.loadProducts =
loadProducts;
