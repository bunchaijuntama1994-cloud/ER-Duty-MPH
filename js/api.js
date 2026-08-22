
/* =========================================================
   ER Duty MPH v1.0
   File : js/api.js
   Data Layer + Storage + API
   ========================================================= */

const APP = {

PIN:"11157",

WEBAPP_URL:"",

STORAGE_KEY:"ER_DUTY_MPH_DATA",

STAFF:[

"พว.หทัยนันท์ เกี้ยวไธสง",
"พว.นิตยา โตสุพรรณ์",
"พว.ณัฏฐดนัยณ์ สันปูเลย",
"พว.ชนินันท์ ขาวสะอาด",
"พว.อินทิรา ธรรมใจกูล",
"พว.บัญชัย จันตะมะ",
"พว.กาญจนา เมืองแมะ",
"พว.ปาริชาติ จันทร์แก้ว",
"พว.ณีรนุช มณีนุกุล",
"พว.วรรณิษา ดอยไพร",
"พว.สุจิตรา จะมัง",
"พว.จิตติมา เนตรวิศุทธ",
"พว.ปนัดดา ดุษฎีโรจน์",
"พว.วราลักษณ์ ทะนะคำ"

]

};

/* -----------------------------
   Local Storage
------------------------------ */

function getRecords(){

const data=localStorage.getItem(APP.STORAGE_KEY);

if(!data) return [];

try{

return JSON.parse(data);

}catch{

return [];

}

}

function saveRecords(records){

localStorage.setItem(

APP.STORAGE_KEY,

JSON.stringify(records)

);

}

/* -----------------------------
   Add Record
------------------------------ */

function addRecord(record){

const records=getRecords();

record.id=Date.now();

record.createdAt=new Date().toISOString();

records.push(record);

saveRecords(records);

return record;

}

/* -----------------------------
   Update
------------------------------ */

function updateRecord(id,newData){

const records=getRecords();

const index=records.findIndex(r=>r.id===id);

if(index>-1){

records[index]={

...records[index],

...newData

};

saveRecords(records);

}

}

/* -----------------------------
   Delete
------------------------------ */

function deleteRecord(id){

const records=getRecords()

.filter(r=>r.id!==id);

saveRecords(records);

}

/* -----------------------------
   Dashboard
------------------------------ */

function getDashboard(){

const records=getRecords();

const totalRecords=records.length;

const totalHours=records.reduce(
// ชั่วโมงแยกตามเวร
const morningHours = records
  .filter(r => r.shift === "เช้า")
  .reduce((sum,r)=>sum+Number(r.hours||0),0);

const afternoonHours = records
  .filter(r => r.shift === "บ่าย")
  .reduce((sum,r)=>sum+Number(r.hours||0),0);

const nightHours = records
  .filter(r => r.shift === "ดึก")
  .reduce((sum,r)=>sum+Number(r.hours||0),0);

// Top 5 บุคลากร
const staffSummary = {};

records.forEach(r=>{
  if(!r.staff) return;
  staffSummary[r.staff]=(staffSummary[r.staff]||0)+Number(r.hours||0);
});

const topStaff = Object.entries(staffSummary)
  .sort((a,b)=>b[1]-a[1])
  .slice(0,5)
  .map(([name,hours])=>({name,hours}));
   
(sum,r)=>sum+Number(r.hours||0),

0

);

const totalEMS = records.filter(
  r => (r.ems || "").trim() !== ""
).length;

const totalRefer = records.filter(
  r => (r.referDx || "").trim() !== "" ||
       (r.referHospital || "").trim() !== ""
).length;

return{
  totalRecords,
  totalHours,
  totalEMS,
  totalRefer,

  morningHours,
  afternoonHours,
  nightHours,

  topStaff
};

}

/* -----------------------------
   Sort Date
------------------------------ */

function sortByDate(records){

return records.sort(

(a,b)=>new Date(a.date)-new Date(b.date)

);

}

/* -----------------------------
   Search
------------------------------ */

function searchRecords(keyword){

const text=keyword.toLowerCase();

return getRecords().filter(r=>{

return(

(r.staff||"").toLowerCase().includes(text)||

(r.detail||"").toLowerCase().includes(text)||

(r.supervisor||"").toLowerCase().includes(text)

);

});

}

/* -----------------------------
   Google Apps Script
------------------------------ */

async function sendToServer(record){

if(!APP.WEBAPP_URL) return;

try{

await fetch(APP.WEBAPP_URL,{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(record)

});

}catch(err){

console.log("Offline Save",err);

}

}

/* -----------------------------
   Save Complete
------------------------------ */

async function saveDuty(record){

addRecord(record);

await sendToServer(record);

return true;

}
