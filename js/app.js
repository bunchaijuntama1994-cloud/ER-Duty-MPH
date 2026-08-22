
/* ==========================================================
   ER Duty MPH
   app.js
   Navigation + Form + Dashboard + Summary + Export
========================================================== */

let editingIndex = -1;

document.addEventListener("DOMContentLoaded", () => {

  initNavigation();
  initForm();
  initButtons();
  initAutoHours();
  initSmartOT();  
  refreshDashboard();
  renderSummary();
  renderPrintTable();
   
});

/* ---------------- Navigation ---------------- */

function initNavigation(){

// เริ่มต้นแสดงหน้าบันทึกข้อมูล
document.querySelectorAll(".page").forEach(p => {
  p.classList.add("hidden");
});

const defaultPage = document.getElementById("formPage");
if (defaultPage) {
  defaultPage.classList.remove("hidden");
}

document.querySelector('.nav-btn[data-page="formPage"]')
  ?.classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(btn => {

    btn.addEventListener("click", () => {

      document.querySelectorAll(".nav-btn")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      document.querySelectorAll(".page")
        .forEach(p => p.classList.add("hidden"));

      const page = document.getElementById(btn.dataset.page);
      if (page) {
        page.classList.remove("hidden");
      }

      if (btn.dataset.page === "dashboardPage") {
        refreshDashboard();
      }

      if (btn.dataset.page === "summaryPage") renderSummary();
      if (btn.dataset.page === "exportPage") renderPrintTable();
    });

  });

}

/* ---------------- Dashboard ---------------- */

function refreshDashboard(){

  const dash=getDashboard();

  document.getElementById("totalRecords").textContent=dash.totalRecords;
  document.getElementById("totalHours").textContent=dash.totalHours;
  document.getElementById("totalEMS").textContent=dash.totalEMS;
  document.getElementById("totalRefer").textContent=dash.totalRefer;
// Average hours per record
const avg = dash.totalRecords
  ? (dash.totalHours / dash.totalRecords).toFixed(1)
  : "0.0";

document.getElementById("avgHours").textContent = avg;

// EMS ratio
const emsRatio = dash.totalRecords
  ? Math.round((dash.totalEMS / dash.totalRecords) * 100)
  : 0;

document.getElementById("emsPercent").textContent = `${emsRatio}%`;
   
document.getElementById("morningHours").textContent =
  `${dash.morningHours} ชม.`;

document.getElementById("afternoonHours").textContent =
  `${dash.afternoonHours} ชม.`;

document.getElementById("nightHours").textContent =
  `${dash.nightHours} ชม.`;

// ===== Top Staff =====
const topList = document.getElementById("topStaffList");

  // ===== Top Staff =====

  if (topList) {
    topList.innerHTML = "";

    if (dash.topStaff.length === 0) {
      topList.innerHTML = "<div>ยังไม่มีข้อมูล</div>";
    } else {
      dash.topStaff.forEach((item, i) => {
        topList.innerHTML += `
          <div class="topstaff-item">
            <span class="topstaff-rank">#${i + 1} ${item.name}</span>
            <span class="topstaff-hours">${item.hours} ชม.</span>
          </div>`;
      });
    }
  }

  // ===== Charts =====
  renderShiftChart(dash);
  renderEMSChart(dash);
}

/* ---------------- Form ---------------- */

function initForm(){

  const staff=document.getElementById("staffSelect");
  const supervisor=document.getElementById("supervisorSelect");

  if(staff){

    staff.innerHTML = '<option value="">เลือกผู้ปฏิบัติงาน</option>';
supervisor.innerHTML = '<option value="">เลือกหัวหน้าเวร</option>';

APP.STAFF.forEach(name=>{
    staff.innerHTML += `<option value="${name}">${name}</option>`;
    supervisor.innerHTML += `<option value="${name}">${name}</option>`;
});

  }

  document.getElementById("dutyDate").value=
    new Date().toISOString().split("T")[0];

  document
    .getElementById("dutyForm")
    .addEventListener("submit",saveForm);
document
    .getElementById("clearBtn")
    .addEventListener("click", clearForm);
}

function clearForm(){

    document.getElementById("dutyForm").reset();

    document.getElementById("dutyDate").value =
        new Date().toISOString().split("T")[0];

    document.querySelectorAll(".hour-btn")
        .forEach(btn=>btn.classList.remove("active"));

    const hour2=document.querySelector('[data-hour="2"]');
    if(hour2) hour2.classList.add("active");

    document.querySelectorAll(".shift-btn")
        .forEach(btn=>btn.classList.remove("active"));

    const morning=document.querySelector('[data-shift="เช้า"]');
    if(morning) morning.classList.add("active");
}
/* ---------------- Buttons ---------------- */

function initButtons(){

  document.querySelectorAll(".hour-btn").forEach(btn=>{

    btn.onclick=()=>{

      document.querySelectorAll(".hour-btn")
        .forEach(b=>b.classList.remove("active"));

      btn.classList.add("active");

      document.getElementById("hourValue").value=btn.dataset.hour;

    };

  });

  document.querySelectorAll(".shift-chip").forEach(btn=>{

    btn.onclick=()=>{

      document.querySelectorAll(".shift-chip")
        .forEach(b=>b.classList.remove("active"));

      btn.classList.add("active");

      document.getElementById("shiftValue").value=btn.dataset.shift;

    };

  });

  document.getElementById("exportPdfBtn").onclick=()=>window.print();

}

function initAutoHours(){

  const start=document.getElementById("timeStart");
  const end=document.getElementById("timeEnd");
  const hourInput=document.getElementById("hourValue");

  if(!start||!end||!hourInput) return;

  function calculateHours(){

    if(!start.value||!end.value) return;

    const [sh,sm]=start.value.split(":").map(Number);
    const [eh,em]=end.value.split(":").map(Number);

    let startMin=sh*60+sm;
    let endMin=eh*60+em;

    if(endMin<startMin){
      endMin+=24*60;
    }

    const diff=Math.round((endMin-startMin)/60);

    hourInput.value=diff;

    document.querySelectorAll(".hour-btn")
      .forEach(btn=>btn.classList.remove("active"));

    const btn=document.querySelector(`.hour-btn[data-hour="${diff}"]`);

    if(btn){
      btn.classList.add("active");
    }
  }

  start.addEventListener("change",calculateHours);
  end.addEventListener("change",calculateHours);
}
/* ---------------- Smart OT ---------------- */

function initSmartOT(){

  const dutyType = document.getElementById("dutyType");
  const shiftInput = document.getElementById("shiftValue");

  if(!dutyType || !shiftInput) return;

  function applyDefaultTime(){

    const shift = shiftInput.value;

    const start = document.getElementById("timeStart");
    const end   = document.getElementById("timeEnd");

    if(!start || !end) return;

    // EMS / Refer ไม่บังคับเวลา
    if(dutyType.value === "ไม่ระบุ"){
      return;
    }

    const table = {
      "เช้า": ["16:00","18:00"],
      "บ่าย": ["00:00","02:00"],
      "ดึก": ["08:00","10:00"]
    };

    const t = table[shift];

    if(!t) return;

    start.value = t[0];
    end.value   = t[1];

    // กระตุ้นให้ initAutoHours คำนวณใหม่
    start.dispatchEvent(new Event("change"));
  }

  dutyType.addEventListener("change",applyDefaultTime);

  document.querySelectorAll(".shift-chip").forEach(btn=>{
    btn.addEventListener("click",()=>{
      setTimeout(applyDefaultTime,0);
    });
  });

}

/* ---------------- Save ---------------- */

async function saveForm(e){

e.preventDefault();

const dutyType = document.getElementById("dutyType").value;

const record = {
    date:document.getElementById("dutyDate").value,

    staff:
      document.getElementById("staffOther").value ||
      document.getElementById("staffSelect").value,

    dutyType: dutyType,

    ems:document.getElementById("emsDetail").value,

    referDx:document.getElementById("referDx").value,

    referHospital:document.getElementById("referHospital").value,

    timeStart:document.getElementById("timeStart").value,

    timeEnd:document.getElementById("timeEnd").value,

    hours:Number(document.getElementById("hourValue").value),

    shift:document.getElementById("shiftValue").value,

    supervisor:document.getElementById("supervisorSelect").value,

    standby: ["EMS","Refer"].includes(dutyType)
  ? dutyType
  : ""

  };

  if(editingIndex===-1){

    await saveDuty(record);

}else{

    updateRecord(editingIndex,record);

    editingIndex=-1;

}

  alert("บันทึกข้อมูลเรียบร้อย");

  document.getElementById("dutyForm").reset();

  document.getElementById("dutyDate").value=
    new Date().toISOString().split("T")[0];

  refreshDashboard();
  renderSummary();
  renderPrintTable();

}
function updateRecord(id, newData) {
  const records = getRecords();

  const index = records.findIndex(r => r.id === id);

  if (index === -1) {
    alert("ไม่พบรายการที่ต้องการแก้ไข");
    return;
  }

  records[index] = {
    ...records[index],
    ...newData,
    id: records[index].id
  };

  saveRecords(records);
}
/* ---------------- Summary ---------------- */

function renderSummary(){

  const body=document.getElementById("summaryTableBody");

  if(!body) return;

  const records=sortByDate(getRecords());

  if(records.length===0){

    body.innerHTML=`
    <tr>
      <td colspan="9">
        <div class="empty-state">
          <i class="fa-solid fa-folder-open"></i>
          <p>ยังไม่มีข้อมูล</p>
        </div>
      </td>
    </tr>`;

    return;

  }

  body.innerHTML="";

  records.forEach((r,index)=>{

    body.innerHTML+=`
      <tr>

        <td class="summary-date">${formatDate(r.date)}</td>

        <td>${r.staff}</td>

        <td>${r.dutyType}</td>

        <td>${r.timeStart||"-"} - ${r.timeEnd||"-"}</td>

        <td>${r.hours}</td>

        <td><span class="shift-badge shift-${shiftClass(r.shift)}">${r.shift}</span></td>

        <td>${r.ems?'<span class="badge-ems">EMS</span>':'-'}</td>

        <td>${r.referDx?'<span class="badge-refer">Refer</span>':'-'}</td>

        <td>${r.supervisor||"-"}</td>
<td class="action-cell">
        <button class="edit-btn" onclick="editRecord(${index})">
          <i class="fa-solid fa-pen"></i>
        </button>

        <button class="delete-btn" onclick="deleteRecord(${index})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>`;
});

}

function editRecord(index){

    const r = getRecords()[index];
    if(!r) return;

    editingIndex = r.id;
   
    document.querySelector('[data-page="formPage"]').click();

    document.getElementById("staffSelect").value = r.staff || "";
    document.getElementById("staffOther").value = r.alias || "";
    document.getElementById("dutyDate").value = r.date || "";
    document.getElementById("dutyType").value = r.dutyType || "";
    document.getElementById("timeStart").value = r.timeStart || "";
    document.getElementById("timeEnd").value = r.timeEnd || "";
    document.getElementById("supervisorSelect").value = r.supervisor || "";
    document.getElementById("hourValue").value = r.hours || 2;
    document.getElementById("shiftValue").value = r.shift || "เช้า";

    document.querySelectorAll(".hour-btn").forEach(btn=>btn.classList.remove("active"));
    document.querySelector(`[data-hour="${r.hours}"]`)?.classList.add("active");

    document.querySelectorAll(".shift-btn").forEach(btn=>btn.classList.remove("active"));
    document.querySelector(`[data-shift="${r.shift}"]`)?.classList.add("active");
}

function deleteRecord(index){

    if(!confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) return;

    const records = getRecords();

records.splice(index,1);

saveRecords(records);

refreshDashboard();
renderSummary();
renderPrintTable();
}
/* ---------------- Print Table ---------------- */

function renderPrintTable(){

  const body=document.getElementById("printTableBody");

  if(!body) return;

  const records=sortByDate(getRecords());

  body.innerHTML="";

  records.forEach(r=>{

    body.innerHTML += `
<tr>
  <td>${formatDate(r.date)}</td>
  <td>${r.staff || "-"}</td>
  <td>${r.dutyType || "-"}</td>
  <td>${r.timeStart || "--:--"} - ${r.timeEnd || "--:--"}</td>
  <td>${r.hours || "-"}</td>
  <td>${r.shift || "-"}</td>
  <td>${r.supervisor || "-"}</td>
</tr>`;

  });
const latest = records[0];

document.getElementById("printStaffName").textContent =
    latest?.staff || "ผู้ปฏิบัติงาน";

}
let shiftChart = null;
let emsChart = null;

function renderShiftChart(dash){
  const canvas = document.getElementById("shiftChart");
  if(!canvas || typeof Chart === "undefined") return;

  if(shiftChart) shiftChart.destroy();

  shiftChart = new Chart(canvas,{
    type:"bar",
    data:{
      labels:["เช้า","บ่าย","ดึก"],
      datasets:[{
        label:"ชั่วโมงเวร",
        data:[dash.morningHours,dash.afternoonHours,dash.nightHours]
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false
    }
  });
}

function renderEMSChart(dash){
  const canvas = document.getElementById("emsChart");
  if(!canvas || typeof Chart === "undefined") return;

  if(emsChart) emsChart.destroy();

  const ems = dash.totalEMS;
  const other = Math.max(dash.totalRecords-ems,0);

  emsChart = new Chart(canvas,{
    type:"doughnut",
    data:{
      labels:["EMS","ทั่วไป"],
      datasets:[{
        data:[ems,other]
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false
    }
  });
}

/* ---------------- Helpers ---------------- */

function shiftClass(s){

  if(s==="เช้า") return "morning";
  if(s==="บ่าย") return "afternoon";
  return "night";

}

function formatDate(d){

  if(!d) return "-";

  return new Date(d)
    .toLocaleDateString("th-TH");

}
