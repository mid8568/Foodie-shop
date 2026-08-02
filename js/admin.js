console.log(
"admin.js启动"
);




// Supabase


const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";



const supabaseClient =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);





document.addEventListener(
"DOMContentLoaded",
()=>{


loadDashboard();


});







async function loadDashboard(){



// 商品数量


let {

count:total

}=await supabaseClient

.from("products")

.select(
"*",
{
count:"exact",
head:true
}
);



document.getElementById(
"total-products"
).innerText =
total || 0;








// 上架


let {

count:online

}=await supabaseClient

.from("products")

.select(
"*",
{
count:"exact",
head:true
}
)

.eq(
"stock_status",
"上架"
);



document.getElementById(
"online-products"
).innerText =
online || 0;








// 下架


let {

count:offline

}=await supabaseClient

.from("products")

.select(
"*",
{
count:"exact",
head:true
}
)

.eq(
"stock_status",
"下架"
);



document.getElementById(
"offline-products"
).innerText =
offline || 0;








// 图片数量


let {

data

}=await supabaseClient

.from("products")

.select(
"image,image2,image3,image4,detail_images"
);




let num=0;



data.forEach(
p=>{


if(p.image)
num++;


if(p.image2)
num++;


if(p.image3)
num++;


if(p.image4)
num++;



if(
Array.isArray(
p.detail_images
)
){

num+=
p.detail_images.length;

}


});




document.getElementById(
"total-images"
).innerText =
num;



}







//退出

function logout(){


localStorage.removeItem(
"admin_login"
);


location.href=
"admin-login.html";


}



window.logout =
logout;
