
/* ==========================================================
   ER Duty MPH
   app.js
   Navigation + Form + Dashboard + Summary + Export
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  initNavigation();
  initForm();
  initButtons();
  refreshDashboard();
  renderSummary();
  renderPrintTable();
   
  // ===== ซ่อน/แสดง เวลาและชั่วโมง =====
  const dutyType = document.getElementById("dutyType");
  const timeSection = document.getElementById("timeSection");
  const hourSection = document.getElementById("hourSection");

  function toggleDutyFields() {
    const hide = dutyType.value === "ไม่ระบุ";
    timeSection.style.display = hide ? "none" : "block";
    hourSection.style.display = hide ? "none" : "block";
  }

  toggleDutyFields();
  dutyType.addEventListener("change", toggleDutyFields);
});

/* ---------------- Navigation ---------------- */

function initNavigation(){

  document.querySelectorAll(".nav-btn").forEach(btn=>{

    btn.addEventListener("click",()=>{

      document.querySelectorAll(".nav-btn")
        .forEach(b=>b.classList.remove("active"));

      btn.classList.add("active");

      document.querySelectorAll(".page")
        .forEach(p=>p.classList.add("hidden"));

      document
        .getElementById(btn.dataset.page)
        .classList.remove("hidden");

      if(btn.dataset.page==="summaryPage") renderSummary();
      if(btn.dataset.page==="exportPage") renderPrintTable();

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

}

/* ---------------- Form ---------------- */

function initForm(){

  const staff=document.getElementById("staffSelect");
  const supervisor=document.getElementById("supervisorSelect");

  if(staff){

    APP.STAFF.forEach(name=>{

      staff.innerHTML+=`<option value="${name}">${name}</option>`;

      supervisor.innerHTML+=`<option value="${name}">${name}</option>`;

    });

  }

  document.getElementById("dutyDate").value=
    new Date().toISOString().split("T")[0];

  document
    .getElementById("dutyForm")
    .addEventListener("submit",saveForm);

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

/* ---------------- Save ---------------- */

async function saveForm(e){

  e.preventDefault();

  const record={

    date:document.getElementById("dutyDate").value,

    staff:
      document.getElementById("staffOther").value ||
      document.getElementById("staffSelect").value,

    dutyType:document.getElementById("dutyType").value,

    ems:document.getElementById("emsDetail").value,

    referDx:document.getElementById("referDx").value,

    referHospital:document.getElementById("referHospital").value,

    timeStart:document.getElementById("timeStart").value,

    timeEnd:document.getElementById("timeEnd").value,

    hours:Number(document.getElementById("hourValue").value),

    shift:document.getElementById("shiftValue").value,

    supervisor:document.getElementById("supervisorSelect").value,

    standby:
      document.getElementById("emsDetail").value.trim()!==""?"EMS":
      document.getElementById("referDx").value.trim()!==""?"Refer":""

  };

  await saveDuty(record);

  alert("บันทึกข้อมูลเรียบร้อย");

  document.getElementById("dutyForm").reset();

  document.getElementById("dutyDate").value=
    new Date().toISOString().split("T")[0];

  refreshDashboard();
  renderSummary();
  renderPrintTable();

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

  records.forEach(r=>{

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

      </tr>`;

  });

}

/* ---------------- Print Table ---------------- */

function renderPrintTable(){

  const body=document.getElementById("printTableBody");

  if(!body) return;

  const records=sortByDate(getRecords());

  body.innerHTML="";

  records.forEach(r=>{

    body.innerHTML+=`
      <tr>

        <td>${formatDate(r.date)}</td>

        <td>${r.staff}</td>

        <td>${r.dutyType}</td>

        <td>${r.timeStart||"-"} - ${r.timeEnd||"-"}</td>

        <td>${r.hours}</td>

        <td>${r.shift}</td>

        <td>${r.supervisor||"-"}</td>

      </tr>`;

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
