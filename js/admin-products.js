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
// 加载商品
// =========================


async function loadProducts(){


const box =
document.getElementById(
"product-list"
);



const {

data,

error

}=await client


.from("products")

.select("*")

.order(
"id",
{
ascending:false
}
);




if(error){


box.innerHTML =
"加载失败："+error.message;


return;


}






let html="";






data.forEach(item=>{



let url =

window.location.origin

+

"/product.html?id="

+

item.id;






html += `


<div class="admin-product-card">



<img

src="${item.image || ''}"

width="120"

>





<h3>

${item.name_en || item.name}

</h3>





<p>

价格：

$${item.price}

</p>





<p>

状态：

${item.stock_status}

</p>







<button

onclick="copyLink('${url}')">

复制详情链接

</button>







<button

onclick="changeStatus(${item.id},'上架')">

上架

</button>






<button

onclick="changeStatus(${item.id},'下架')">

下架

</button>


<button

onclick="editProduct(${item.id})">

编辑

</button>



<button

onclick="deleteProduct(${item.id})">

删除

</button>





</div>


`;



});






box.innerHTML = html;



}









// =========================
// 修改状态
// =========================


async function changeStatus(id,status){



const {

error

}=await client


.from("products")


.update({

stock_status:status

})


.eq(
"id",
id
);





if(error){

alert(error.message);

return;

}



loadProducts();


}









// =========================
// 删除商品
// =========================


async function deleteProduct(id){



if(!confirm(
"确定删除这个商品吗？"
)){

return;

}






const {

error

}=await client


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




loadProducts();



}









// =========================
// 复制详情链接
// =========================


function copyLink(url){



navigator.clipboard.writeText(url);



alert(
"商品链接已复制"
);



}

function editProduct(id){

location.href =
"admin-edit.html?id="+id;

}




loadProducts();
