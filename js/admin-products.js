const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";


const client =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);





async function loadProducts(){


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

console.log(error);

return;

}



const box =
document.getElementById(
"productList"
);



box.innerHTML="";



data.forEach(
p=>{


box.innerHTML += `


<tr>


<td>

<img

src="${p.image}"

width="80">

</td>



<td>

${p.name}

</td>



<td>

${p.price}

${p.currency}

</td>



<td>

${p.stock_status}

</td>




<td>


<button

onclick="editProduct(${p.id})">

编辑

</button>



<button

onclick="deleteProduct(${p.id})">

删除

</button>



</td>


</tr>


`;



});



}







function editProduct(id){


location.href=

"admin.html?id="

+

id;


}








async function deleteProduct(id){



if(!confirm(
"确定删除商品？"
))
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







loadProducts();
