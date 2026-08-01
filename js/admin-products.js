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



let products=[];



// =======================
// 初始化
// =======================


window.onload=function(){

loadProducts();

};





// =======================
// 获取商品
// =======================


async function loadProducts(){


const {
data,
error
}=await supabaseClient

.from("products")

.select("*")

.order(
"created_at",
{
ascending:false
}
);



if(error){

console.log(error);

return;

}



products=data || [];


renderProducts();


}







// =======================
// 渲染列表
// =======================


function renderProducts(){


const box =
document.getElementById(
"productTable"
);



box.innerHTML="";



products.forEach(product=>{


let status =
product.stock_status || "下架";



let seo =
product.seo_title
?
"✔ 已优化"
:
"未设置";



let profit="";


if(product.sale_price && product.cost_price){

profit =
(
product.sale_price -
product.cost_price
).toFixed(2);

}



box.innerHTML +=`


<tr>


<td>

<input 
type="checkbox"
value="${product.id}">

</td>




<td>


<div class="product-info">


<img 

src="${product.image || ''}"

class="product-img">



<div>


<div class="product-name">

${product.name || "未命名"}

</div>



<div>

${product.name_en || ""}

</div>



<div>

ID:
${product.id}

</div>



${
product["1688_url"]

?

`

<a 
href="${product["1688_url"]}"
target="_blank">

1688来源

</a>

`

:""

}



</div>


</div>


</td>







<td>


<span class="status">


${

status==="上架"

?

"🟢 在售"

:

"⚪ 下架"

}


</span>


</td>








<td>


<p>

售价：

${product.sale_price || product.price || 0}

</p>


<p>

成本：

${product.cost_price || 0}

</p>



<p>

利润：

${profit}

</p>



<p>

库存：

${product.stock_quantity || 0}

</p>



<p>

分类：

${product.category || "-"}

</p>



</td>







<td>


${seo}


<br>


${
product.seo_description
?
"描述完成"
:
"无描述"
}


</td>








<td>


<button

onclick="editProduct(${product.id})">

编辑

</button>



<button

onclick="deleteProduct(${product.id})">

删除

</button>



</td>


</tr>



`;



});



}









// =======================
// 新建商品
// =======================


function openProductAdd(){


window.location.href =
"admin-edit.html";


}








// =======================
// 编辑
// =======================


function editProduct(id){


window.location.href =
"admin-edit.html?id="+id;


}









// =======================
// 删除
// =======================


async function deleteProduct(id){


if(
!confirm(
"确定删除这个商品?"
)
)

return;



const {
error
}=await supabaseClient

.from("products")

.delete()

.eq(
"id",
id
);



if(error){

alert(error.message);

return;

}



alert(
"删除成功"
);



loadProducts();



}









// =======================
// 批量删除
// =======================


async function batchDelete(){



let ids=[];



document

.querySelectorAll(
"#productTable input[type=checkbox]:checked"
)

.forEach(item=>{


ids.push(
Number(item.value)
);


});





if(ids.length===0){


alert(
"请选择商品"
);


return;


}





const {
error
}=await supabaseClient

.from("products")

.delete()

.in(
"id",
ids
);



if(error){

alert(error.message);

return;

}



alert(
"批量删除完成"
);



loadProducts();



}









// =======================
// 搜索
// =======================


async function searchProducts(){


let keyword =
document.getElementById(
"searchInput"
).value;



const {
data,
error
}=await supabaseClient

.from("products")

.select("*")

.or(

`
name.ilike.%${keyword}%,
name_en.ilike.%${keyword}%
`

);



if(error)
return;



products=data || [];


renderProducts();


}
