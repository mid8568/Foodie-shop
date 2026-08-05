console.log(
"admin-decoration-images启动"
);



const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"你的anon key";


const supabaseClient =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);



async function loadImages(){


let box =
document.getElementById(
"image-list"
);



box.innerHTML=
"加载中...";



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



if(error){

box.innerHTML=
"加载失败";

console.error(error);

return;

}



box.innerHTML="";



data.forEach(item=>{


if(!item.name)
return;



const {
data:urlData
}
=
supabaseClient
.storage
.from("decorations")
.getPublicUrl(
item.name
);



let url =
urlData.publicUrl;



box.innerHTML +=


`

<div class="image-card">


<img src="${url}">


<div class="image-name">

${item.name}

</div>


<button
onclick="deleteImage('${item.name}')">

删除

</button>


</div>

`;



});


}




async function deleteImage(name){


if(
!confirm(
"确定删除这张装修图片?"
)
)
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

alert(
"删除失败:"
+
error.message
);

return;

}



alert(
"删除成功"
);



loadImages();



}




window.deleteImage =
deleteImage;



loadImages();
