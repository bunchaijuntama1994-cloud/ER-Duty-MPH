/* =========================================================
   ER Duty MPH
   File : js/login.js
   Login System
   ========================================================= */

const USER_KEY="ER_DUTY_USER";

document.addEventListener("DOMContentLoaded",()=>{

    initLogin();

});

function initLogin(){

    const userSelect=document.getElementById("loginUser");

    if(!userSelect) return;

    userSelect.innerHTML="";

    APP.STAFF.forEach(name=>{

        const option=document.createElement("option");

        option.value=name;

        option.textContent=name;

        userSelect.appendChild(option);

    });

    const lastUser=localStorage.getItem(USER_KEY);

    if(lastUser){

        userSelect.value=lastUser;

    }

    const loginBtn=document.getElementById("loginBtn");

    if(loginBtn){

        loginBtn.addEventListener("click",login);

    }

    const logoutBtn=document.getElementById("logoutBtn");

    if(logoutBtn){

        logoutBtn.addEventListener("click",logout);

    }

}

function login(){

    const pin=document.getElementById("loginPin");

    const user=document.getElementById("loginUser");

    if(!pin||!user) return;

    if(pin.value!==APP.PIN){

        alert("รหัสผ่านไม่ถูกต้อง");

        pin.focus();

        return;

    }

    localStorage.setItem(USER_KEY, user.value);
sessionStorage.setItem("currentUser", JSON.stringify({ username: user.value }));

document.getElementById("currentUser").textContent = user.value;

    document.getElementById("loginScreen").classList.add("hidden");

    document.getElementById("appContainer").classList.remove("hidden");

    pin.value="";

    if(typeof refreshDashboard==="function") refreshDashboard();
if(typeof renderSummary==="function") renderSummary();
if(typeof renderPrintTable==="function") renderPrintTable();
if(typeof clearForm==="function") clearForm();

    }

}

function logout(){

  document.getElementById("appContainer").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");

  sessionStorage.removeItem("currentUser");

  if(typeof renderSummary==="function") renderSummary();
  if(typeof renderPrintTable==="function") renderPrintTable();
  if(typeof clearForm==="function") clearForm();
}
