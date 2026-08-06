console.log("admin-products.js 启动成功");


const SUPABASE_URL="https://ukxxmxnubxjezkwbbxdr.supabase.co";

const SUPABASE_KEY="sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";


const supabaseClient=supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);



const PAGE_SIZE=15;


let currentPage=1;

let totalPages=1;

let totalCount=0;



let filterParams={

keywordTitle:"",

keywordId:"",

keywordCode:"",

statusTab:"出售中"

};





function escapeHtml(str){

if(!str)return "";

return String(str)

.replace(/&/g,"&amp;")

.replace(/</g,"&lt;")

.replace(/>/g,"&gt;")

.replace(/"/g,"&quot;")

.replace(/'/g,"&#039;");

}







function getSalePrice(item){


if(item.price){

return Number(item.price).toFixed(2);

}



if(item.cost_price){


let rate=7.2;

let shipping=3;

let platform=0.15;

let profit=0.3;



let costUsd=item.cost_price/rate;


let total=costUsd+shipping;


let fee=total/(1-platform);


let sale=fee*(1+profit);



return sale.toFixed(2);


}



return "0.00";


}









document.addEventListener(
"DOMContentLoaded",
()=>{


initTabs();


loadProducts();


});








function initTabs(){


const tabs=document.querySelectorAll(
".tabs .tab-item"
);



tabs.forEach(tab=>{


tab.addEventListener(
"click",
function(){


tabs.forEach(t=>
t.classList.remove("active")
);



this.classList.add("active");



filterParams.statusTab=

this.innerText
.split("(")[0]
.trim();



loadProducts(1);



});


});


}









async function loadProducts(page=1){


currentPage=page;



let start=(page-1)*PAGE_SIZE;


let end=start+PAGE_SIZE-1;





let query=supabaseClient

.from("products")

.select(`

*,

product_skus(*)

`,
{
count:"exact"
})

.order(
"id",
{
ascending:false
})

.range(
start,
end
);







if(filterParams.statusTab==="出售中"){


query=query.eq(
"stock_status",
"上架"
);


}




if(filterParams.statusTab==="仓库中"){


query=query.eq(
"stock_status",
"下架"
);


}






if(filterParams.keywordTitle){


query=query.ilike(
"name",
`%${filterParams.keywordTitle}%`
);


}







if(filterParams.keywordId){


let ids=

filterParams.keywordId

.split(/[,，\s]+/)

.map(id=>id.trim())

.filter(id=>id);



if(ids.length){

query=query.in(
"id",
ids
);


}


}







if(filterParams.keywordCode){


query=query.ilike(
"1688_url",
`%${filterParams.keywordCode}%`
);


}






const {

data,

count,

error

}=await query;





if(error){


console.error(
"加载商品失败:",
error
);



document.getElementById(
"product-list"
).innerHTML=


`
<tr>
<td colspan="10"
style="text-align:center;color:red;padding:20px">

商品加载失败

</td>
</tr>
`;



return;


}







totalCount=count||0;


totalPages=

Math.ceil(
totalCount/PAGE_SIZE
)||1;





renderProducts(
data||[]
);



renderPaginationInfo();



}
// =======================
// 商品列表渲染
// =======================


function renderProducts(products){


const box=document.getElementById(
"product-list"
);



if(!box)return;



box.innerHTML="";





if(!products.length){


box.innerHTML=

`
<tr>
<td colspan="10"
style="text-align:center;color:#999;padding:20px">

暂无商品

</td>
</tr>
`;

return;


}






products.forEach(item=>{



let tr=document.createElement(
"tr"
);





let isOnline=

item.stock_status==="上架";



let statusClass=

isOnline

?

"status-tag"

:

"status-tag offline";



let statusText=

item.stock_status||"下架";






let name=

escapeHtml(
item.name||"未命名商品"
);






let url1688=

item["1688_url"]

?

escapeHtml(
item["1688_url"]
)

:

"";






// =======================
// SKU计算
// =======================


let skus=

item.product_skus || [];



let skuCount=

skus.length;





let skuPrices=

skus

.map(
s=>Number(
s.sale_price
)
)

.filter(
p=>p>0
);





let skuPrice="";





if(skuPrices.length){



let min=

Math.min(
...skuPrices
);



let max=

Math.max(
...skuPrices
);




skuPrice=


min===max

?

"$"+min.toFixed(2)

:

"$"+min.toFixed(2)

+

" - $"

+

max.toFixed(2);



}

else{


skuPrice=

"$"+

(
item.price||

getSalePrice(item)

);



}






// =======================
// SKU库存
// =======================


let stock=0;



if(skuCount){



stock=

skus.reduce(
(sum,sku)=>

sum+

Number(
sku.stock_quantity||0
),

0
);



}else{


stock=

item.stock_quantity||0;


}








tr.innerHTML=

`

<td width="30">

<input

type="checkbox"

class="select-item"

value="${item.id}">

</td>





<td width="70">

<img

src="${escapeHtml(item.image)||'https://via.placeholder.com/50'}"

class="table-image">

</td>






<td class="product-name">


<div>

${name}

</div>



<div style="color:#999;font-size:12px;margin-top:4px">

ID:${item.id}

</div>



${url1688?

`

<a href="${url1688}" target="_blank">

1688链接

</a>

`

:

""

}



</td>







<td class="cost-price">

¥${item.cost_price||0}

</td>







<td>

${skuCount}

</td>







<td class="sale-price">

${skuPrice}

</td>







<td>

${item.sales_count||0}

</td>







<td>

<input

type="number"

value="${stock}"

id="stock-${item.id}"

class="edit-stock"

onblur="updateProductField('${item.id}')">

</td>







<td>


<div style="font-size:12px;color:#666">

${

item.created_at

?

new Date(
item.created_at
)

.toLocaleString(
"zh-CN",
{
hour12:false
}
)

:

"-"

}

</div>



<span class="${statusClass}">

${statusText}

</span>



</td>








<td>


<a href="javascript:void(0)"

onclick="editProduct('${item.id}')">

编辑商品

</a>



<br>



<a href="javascript:void(0)"

onclick="toggleStatus('${item.id}','${item.stock_status}')">

${

isOnline

?

"下架商品"

:

"上架商品"

}

</a>



</td>





`;



box.appendChild(tr);



});



}








// =======================
// 搜索
// =======================


function searchProduct(){


filterParams.keywordTitle=

document.getElementById(
"search-title"
)?.value.trim()
||"";



filterParams.keywordId=

document.getElementById(
"search-id"
)?.value.trim()
||"";



filterParams.keywordCode=

document.getElementById(
"search-code"
)?.value.trim()
||"";



loadProducts(1);


}







function resetSearch(){



let title=

document.getElementById(
"search-title"
);



let id=

document.getElementById(
"search-id"
);



let code=

document.getElementById(
"search-code"
);




if(title)title.value="";

if(id)id.value="";

if(code)code.value="";




filterParams.keywordTitle="";

filterParams.keywordId="";

filterParams.keywordCode="";



loadProducts(1);


}
// =======================
// 修改库存
// =======================


async function updateProductField(id){


let stockInput=

document.getElementById(
"stock-"+id
);



if(!stockInput)return;



let stock=

Number(
stockInput.value
);





const {

error

}=await supabaseClient

.from("products")

.update({

stock_quantity:stock

})

.eq(
"id",
id
);




if(error){


console.error(
"库存修改失败:",
error
);


alert(
"修改失败"
);


return;


}



console.log(
"库存修改成功:",
id
);



}









// =======================
// 修改商品状态
// =======================


async function toggleStatus(
id,
currentStatus
){



let newStatus=

currentStatus==="上架"

?

"下架"

:

"上架";






const {

error

}=await supabaseClient

.from("products")

.update({

stock_status:newStatus,

status:newStatus

})

.eq(
"id",
id
);





if(error){


console.error(
"状态修改失败:",
error
);



alert(
"状态修改失败"
);



return;


}




loadProducts(
currentPage
);



}









// =======================
// 编辑商品
// =======================


function editProduct(id){


if(
window.parent
&&
window.parent.openPage
){



window.parent.openPage(
"edit",
id
);



}else{



window.location.href=

"admin.html?page=edit&id="+id;



}


}









// =======================
// 新增商品
// =======================


function addProduct(){


if(
window.parent
&&
window.parent.openPage
){



window.parent.openPage(
"add-product"
);



}else{


alert(
"打开新增商品"
);



}


}









// =======================
// 全选
// =======================


function toggleSelectAll(
masterCheckbox
){


const list=

document.querySelectorAll(
".select-item"
);



list.forEach(
item=>{


item.checked=

masterCheckbox.checked;



});


}









// =======================
// 分页
// =======================


function renderPaginationInfo(){


const box=

document.getElementById(
"page-info"
)
||
document.getElementById(
"pagination"
);



if(!box)return;





const master=

document.getElementById(
"select-all"
);



if(master){

master.checked=false;

}






box.innerHTML=



`

<span style="color:#666">

共 <strong>${totalCount}</strong> 件商品

</span>




<button

class="btn-page"

onclick="changePage(${currentPage-1})"

${

currentPage<=1

?

"disabled"

:

""

}

>

&lt; 上一页

</button>





<span>

${currentPage}/${totalPages}

</span>





<button

class="btn-page"

onclick="changePage(${currentPage+1})"

${

currentPage>=totalPages

?

"disabled"

:

""

}

>

下一页 &gt;

</button>





<span>


<input

type="number"

id="jump-page-input"

value="${currentPage}"

style="width:45px;height:26px;text-align:center">



<button

class="btn-page"

onclick="jumpToPage()">

GO

</button>


</span>



`;



}








function changePage(page){


if(

page<1

||

page>totalPages

||

page===currentPage

){

return;

}



loadProducts(page);



}








function jumpToPage(){



let input=

document.getElementById(
"jump-page-input"
);



if(!input)return;



let page=

parseInt(
input.value
);



if(isNaN(page))return;



if(page<1){

page=1;

}



if(page>totalPages){

page=totalPages;

}



changePage(page);



}









// =======================
// 暴露函数
// =======================


window.loadProducts=
loadProducts;



window.searchProduct=
searchProduct;



window.resetSearch=
resetSearch;



window.addProduct=
addProduct;



window.editProduct=
editProduct;



window.toggleStatus=
toggleStatus;



window.updateProductField=
updateProductField;



window.changePage=
changePage;



window.jumpToPage=
jumpToPage;



window.toggleSelectAll=
toggleSelectAll;
