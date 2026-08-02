console.log(
"admin-images.js启动"
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





let products=[];




document.addEventListener(
"DOMContentLoaded",
()=>{


loadProducts();


});







// 加载商品


async function loadProducts(){


let {

data,

error

}=await supabaseClient

.from("products")

.select(
"id,name,image"
)

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



products=data;


renderProducts();


}








// 商品列表


function renderProducts(){


let box =
document.getElementById(
"image-product-list"
);



box.innerHTML="";



products.forEach(
item=>{



box.innerHTML += `


<tr>


<td>

<img

src="${item.image || ''}"

class="table-image"

>


</td>



<td>

${item.name}

</td>



<td>


<button

onclick="openImages(${item.id})"

>

查看图片

</button>


</td>



</tr>


`;



});



}










// 打开图片


async function openImages(id){



let {

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





document.getElementById(
"product-box"
)
.style.display="none";




document.getElementById(
"image-detail-box"
)
.style.display="block";




document.getElementById(
"current-product-name"
)
.innerText =
data.name;







let main=[];


if(data.image)
main.push(data.image);


if(data.image2)
main.push(data.image2);


if(data.image3)
main.push(data.image3);


if(data.image4)
main.push(data.image4);





renderImages(
"main-images",
main
);





renderImages(
"detail-images",
data.detail_images || []
);



}









// 显示图片


function renderImages(boxId,list){


let box =
document.getElementById(
boxId
);



box.innerHTML="";



list.forEach(
url=>{


box.innerHTML +=`


<div class="image-card">


<img src="${url}">


</div>


`;


});


}







// 返回


function backProducts(){


document.getElementById(
"product-box"
)
.style.display="block";



document.getElementById(
"image-detail-box"
)
.style.display="none";


}




window.openImages =
openImages;


window.backProducts =
backProducts;
