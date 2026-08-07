const supabase=require("./supabase");


async function run(){


const {

data

}=await supabase

.from("products")

.select("*");



for(let p of data){


let imgs=[];


[
p.image,
p.image2,
p.image3,
p.image4,
...(p.detail_images||[])

]

.forEach(i=>{

if(i)
imgs.push(i);

});



for(let url of imgs){


await supabase

.from("images")

.upsert({

url:url,

type:"product"

});


}


}


console.log("同步完成");


}


run();
