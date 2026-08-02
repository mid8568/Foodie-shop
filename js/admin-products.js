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
"%"+keyword+"%"
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



loadProducts(keyword);



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
