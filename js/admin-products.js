// =========================
// Supabase
// =========================

console.log("products-admin.js 已加载");


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


console.log("开始读取products");



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



console.log(
"商品数据:",
data
);


console.log(
"错误:",
error
);



if(error){

alert(error.message);

return;

}



const box =
document.getElementById(
"productList"
);



if(!box){

console.log(
"没有找到productList"
);

return;

}



box.innerHTML="";




data.forEach(product=>{


box.innerHTML += `


<tr>


<td>

<img

src="${product.image || ''}"

width="80"

height="80">

</td>



<td>

${product.name || ""}

</td>



<td>

${product.price || 0}

${product.currency || ""}

</td>



<td>

${product.stock_status || ""}

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



<button

onclick="changeStatus(${product.id},'${product.stock_status}')">

上下架

</button>



</td>



</tr>


`;



});



}





// =========================
// 编辑
// =========================


function editProduct(id){


location.href =
"admin.html?id="+id;


}





// =========================
// 删除
// =========================


async function deleteProduct(id){


if(
!confirm("确定删除?")
)

return;



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
// 上下架
// =========================


async function changeStatus(
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

}=await client


.from("products")


.update({

stock_status:newStatus

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





// 启动

loadProducts();
