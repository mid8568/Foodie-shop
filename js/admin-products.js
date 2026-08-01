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









window.onload=function(){


loadProducts();


};









// =======================
// 加载商品列表
// =======================



async function loadProducts(){



let {

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
// 渲染商品
// =======================



function renderProducts(){



let box =
document.getElementById(
"productTable"
);



box.innerHTML="";





products.forEach(product=>{



box.innerHTML +=



`

<tr>



<td>


<input type="checkbox"
value="${product.id}">


</td>






<td>


<div class="product-info">


<img

src="${product.image || ''}"

width="80"

height="80">





<div>



<p>

${product.name || "未命名商品"}

</p>



<p>

${product.name_en || ""}

</p>



</div>


</div>



</td>








<td>



<span>


${product.stock_status || "未设置"}


</span>



</td>








<td>



分类：

${product.category || "无"}


<br>


采购：

${product.cost_price || 0}



<br>


售价：

${product.sale_price || 0}



</td>








<td>


${

product.seo_title

?

"已优化"

:

"未设置"

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
// 编辑商品
// =======================



function editProduct(id){



window.location.href =


"admin-edit.html?id="+id;



}









// =======================
// 删除商品
// =======================



async function deleteProduct(id){



if(

!confirm(
"确定删除这个商品?"
)

)

return;






let {

error

}=await supabaseClient


.from("products")


.delete()


.eq(
"id",
id
);






if(error){


alert(
error.message
);


return;


}





alert(
"删除成功"
);



loadProducts();



}









// =======================
// 搜索商品
// =======================



async function searchProducts(){



let keyword =

document.getElementById(
"searchInput"
).value;






let {

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




products=data;



renderProducts();



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

.forEach(box=>{


ids.push(
Number(box.value)
);


});






if(ids.length===0){


alert(
"请选择商品"
);


return;


}





await supabaseClient


.from("products")


.delete()


.in(
"id",
ids
);





alert(
"删除完成"
);



loadProducts();



}
