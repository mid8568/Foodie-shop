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
// 登录
// =========================


async function login(){


const email =

document

.getElementById("email")

.value;



const password =

document

.getElementById("password")

.value;




const message =

document.getElementById(
"message"
);




message.innerHTML="登录中...";




const {

data,

error

}=await client.auth.signInWithPassword({

email,

password

});





if(error){


message.innerHTML=

"登录失败：" + error.message;


return;


}




// 保存登录状态

localStorage.setItem(
"admin_login",
"yes"
);



// 跳转后台

location.href="admin.html";



}
