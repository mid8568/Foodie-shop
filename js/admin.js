const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";


const client =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);




async function addProduct(){



const product = {


name:

document.getElementById("name").value,


name_en:

document.getElementById("name_en").value,


category:

document.getElementById("category").value,


image:

document.getElementById("image").value,


price:

Number(
document.getElementById("price").value
),


cost_price:

Number(
document.getElementById("cost_price").value
),



supplier:

document.getElementById("supplier").value,



supplier_url:

document.getElementById("supplier_url").value,



ebay_url:

document.getElementById("ebay_url").value,



description_en:

document.getElementById("description_en").value,



stock_status:

document.getElementById("stock_status").value



};





const {

data,

error

}= await client

.from("products")

.insert(product);





if(error){


alert(
"添加失败:"+error.message
);


return;


}




alert(
"商品添加成功"
);



}
