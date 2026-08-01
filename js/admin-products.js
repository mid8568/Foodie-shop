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




// 当前商品

let currentProduct=null;




// =======================
// 页面加载
// =======================


document.addEventListener(
"DOMContentLoaded",
()=>{

loadProducts();

});





// =======================
// 获取商品
// =======================


async function loadProducts(keyword=""){



let query =
supabaseClient
.from("products")
.select("*")
.order(
"id",
{
ascending:false
}
);




if(keyword){

query =
query.ilike(
"name",
`%${keyword}%`
);

}



const {
data,
error
}=await query;



if(error){

console.log(error);

return;

}




renderProducts(data);



}






// =======================
// 显示列表
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



tr.innerHTML=`

<td>


<img 
src="${item.image || ''}"
class="table-image">


</td>



<td>

${item.name || ""}

</td>



<td>

${item.name_en || ""}

</td>



<td>

${item.price || 0}

</td>



<td>

${item.stock_status || "下架"}

</td>



<td>


<button
onclick="editProduct('${item.id}')">

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



loadProducts(keyword);



}







// =======================
// 编辑商品
// =======================


async function editProduct(id){



const {
data,
error
}=await supabaseClient
.from("products")
.select("*")
.eq(
"id",
id
)
.single();



if(error){

console.log(error);

return;

}



currentProduct=data;



document.getElementById(
"edit-name"
).value =
data.name || "";



document.getElementById(
"edit-name-en"
).value =
data.name_en || "";



document.getElementById(
"edit-description"
).value =
data.description || "";



document.getElementById(
"edit-price"
).value =
data.price || "";



document.getElementById(
"edit-status"
).value =
data.stock_status || "下架";



document.getElementById(
"edit-image"
).src =
data.image || "";



document.getElementById(
"edit-box"
).style.display=
"flex";



}







// =======================
// 保存修改
// =======================


async function saveProduct(){



if(!currentProduct){

return;

}




let updateData={



name:
document.getElementById(
"edit-name"
).value,



name_en:
document.getElementById(
"edit-name-en"
).value,



description:
document.getElementById(
"edit-description"
).value,



price:
Number(
document.getElementById(
"edit-price"
).value
),



stock_status:
document.getElementById(
"edit-status"
).value



};





const {
error
}=await supabaseClient
.from("products")
.update(updateData)
.eq(
"id",
currentProduct.id
);



if(error){

alert(
"保存失败"
);

console.log(error);

return;

}



alert(
"修改成功"
);



closeEdit();


loadProducts();



}







// =======================
// 关闭编辑
// =======================


function closeEdit(){


document.getElementById(
"edit-box"
).style.display=
"none";


currentProduct=null;


}






// =======================
// 添加商品
// =======================


function addProduct(){


alert(
"下一步接入添加商品功能"
);


}
