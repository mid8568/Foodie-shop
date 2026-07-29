const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";


const client =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);




// 上传图片

async function uploadImage(){


const file =

document

.getElementById("imageFile")

.files[0];



if(!file){

alert("请选择图片");

return null;

}



const fileName =

Date.now()
+
"-"
+
file.name;




const {

data,

error

}=await client

.storage

.from("product-images")

.upload(

fileName,

file

);



if(error){


alert(
"图片上传失败"
);


console.log(error);


return null;


}





const url =

SUPABASE_URL

+
"/storage/v1/object/public/product-images/"

+
fileName;



return url;


}








// 添加商品

async function addProduct(){



let imageUrl =

await uploadImage();



if(!imageUrl){

return;

}






const product = {


name:

document.getElementById("name").value,


name_en:

document.getElementById("name_en").value,


category:

document.getElementById("category").value,


image:

imageUrl,



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

error

}=await client

.from("products")

.insert(product);





if(error){


alert(
error.message
);


return;


}




alert(
"商品添加成功"
);



}
