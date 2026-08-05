console.log("admin-images-decor.js启动");


const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";


const supabaseClient =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);



async function loadImages(){


console.log("开始读取装修图片");


let box =
document.getElementById(
"image-list"
);


const {
data,
error
}
=
await supabaseClient
.storage
.from("decorations")
.list(
"",
{
limit:200,
sortBy:{
column:"created_at",
order:"desc"
}
}
);



console.log(
"Storage数据:",
data
);



if(error){

console.error(
error
);

box.innerHTML="加载失败";

return;

}



box.innerHTML="";



data.forEach(item=>{


if(!item.name)
return;



let url =
supabaseClient
.storage
.from("decorations")
.getPublicUrl(
item.name
)
.data.publicUrl;



box.innerHTML +=
`

<div class="image-card">

<img src="${url}">

<p>${item.name}</p>

<button onclick="deleteImage('${item.name}')">
删除
</button>

</div>

`;

});


}



async function deleteImage(name){


if(!confirm("确定删除?"))
return;


const {
error
}
=
await supabaseClient
.storage
.from("decorations")
.remove([
name
]);



if(error){

alert(error.message);
return;

}


loadImages();


}



window.deleteImage=deleteImage;


loadImages();
