const STORAGE_KEY = "ictcComputerSystem";

const DEFAULT_DATA = {
  rooms: [
    {
      name: "Room 405",
      status: "Available",
      professor: "",
      class: ""
    },
    {
      name: "Room 406",
      status: "In Use",
      professor: "",
      class: ""
    },
    {
      name: "Room 407",
      status: "Available",
      professor: "",
      class: ""
    }
  ],

  computers: [
    {
      room: "Room 405",
      id: "PC-001",
      processor: "Intel i5",
      ram: "8 GB",
      storage: "512 GB SSD",
      status: "Available",
      maintenance: "Good"
    },
    {
      room: "Room 405",
      id: "PC-002",
      processor: "Intel i3",
      ram: "8 GB",
      storage: "256 GB SSD",
      status: "Unavailable",
      maintenance: "Good"
    },
    {
      room: "Room 406",
      id: "PC-003",
      processor: "Intel i5",
      ram: "16 GB",
      storage: "512 GB SSD",
      status: "Available",
      maintenance: "Good"
    },
    {
      room: "Room 406",
      id: "PC-004",
      processor: "Ryzen 5",
      ram: "16 GB",
      storage: "1 TB SSD",
      status: "Unavailable",
      maintenance: "Under Repair"
    },
    {
      room: "Room 407",
      id: "PC-005",
      processor: "Intel i5",
      ram: "8 GB",
      storage: "512 GB SSD",
      status: "Available",
      maintenance: "Good"
    }
  ],

  maintenanceRecords: [
    {
      room: "Room 406",
      computerId: "PC-004",
      problem: "Computer is not starting.",
      dateReported: "2026-10-07",
      reportedBy: "Teacher",
      actionTaken: "Computer is being checked by ICTC.",
      status: "Under Repair"
    }
  ]
};


let rooms = [];
let computers = [];
let maintenanceRecords = [];

let selectedRoom = "";

let editingIndex = -1;
let editingMaintenanceIndex = -1;

let selectedRoomIndex = -1;


/* =========================
   DATA FUNCTIONS
========================= */

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}


function saveData() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        rooms,
        computers,
        maintenanceRecords
      })
    );

  } catch (error) {

    console.error("Could not save data:", error);

    alert(
      "Could not save changes. Check your browser storage settings."
    );

  }

}


function applyData(data) {

  rooms = Array.isArray(data.rooms)
    ? data.rooms
    : [];

  computers = Array.isArray(data.computers)
    ? data.computers
    : [];

  maintenanceRecords =
    Array.isArray(data.maintenanceRecords)
      ? data.maintenanceRecords
      : [];


  rooms.forEach(room => {

    if (typeof room.professor !== "string") {
      room.professor = "";
    }

    if (typeof room.class !== "string") {
      room.class = "";
    }

  });

}


async function loadData() {

  const saved = localStorage.getItem(STORAGE_KEY);


  if (saved) {

    try {

      applyData(JSON.parse(saved));

      showRooms();

      return;

    } catch (error) {

      console.warn(
        "Saved data could not be read.",
        error
      );

    }

  }


  try {

    const response = await fetch("data.json");

    if (!response.ok) {
      throw new Error("Could not load data.json");
    }

    applyData(await response.json());

  } catch (error) {

    applyData(cloneData(DEFAULT_DATA));

  }


  saveData();

  showRooms();

}


function esc(value) {

  return String(value ?? "").replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]
  );

}


/* =========================
   LABORATORY HOME PAGE
========================= */

function showRooms() {

  const list = document.getElementById("roomList");

  list.innerHTML = "";


  rooms.forEach((room, index) => {

    const inUse =
      room.status === "In Use";


    const professorInfo = inUse

      ? `
        <p class="professor-info">
          <strong>Professor:</strong>
          ${esc(room.professor || "Not specified")}
        </p>

        <p class="professor-info">
          <strong>Class/Subject:</strong>
          ${esc(room.class || "Not specified")}
        </p>
      `

      : `
        <p class="professor-info">
          No professor assigned
        </p>
      `;


    list.insertAdjacentHTML(
      "beforeend",

      `
      <div class="room ${inUse ? "in-use" : "available"}">

        <h2>${esc(room.name)}</h2>

        <p>Computer Laboratory</p>

        <div class="room-status">
          ${esc(room.status)}
        </div>

        ${professorInfo}

        <button
          class="room-button"
          onclick="changeRoomStatus(${index})">

          ${inUse
            ? "Mark as Available"
            : "Mark as In Use"}

        </button>

        <button
          class="room-button"
          onclick="openRoomByIndex(${index})">

          Open Laboratory

        </button>

      </div>
      `
    );

  });

}


/* =========================
   CHANGE ROOM STATUS
========================= */

function changeRoomStatus(index) {

  const room = rooms[index];

  if (!room) return;


  /* AVAILABLE → IN USE */

  if (room.status === "Available") {

    selectedRoomIndex = index;


    document
      .getElementById("roomForm")
      .reset();


    document
      .getElementById("roomBackground")
      .style.display = "flex";

  }


  /* IN USE → AVAILABLE */

  else {

    if (
      !confirm(
        "Mark " +
        room.name +
        " as Available?"
      )
    ) {
      return;
    }


    room.status = "Available";

    room.professor = "";

    room.class = "";


    saveData();

    showRooms();

  }

}


/* =========================
   SAVE ROOM INFORMATION
========================= */

document
  .getElementById("roomForm")
  .addEventListener(
    "submit",
    event => {

      event.preventDefault();


      if (selectedRoomIndex === -1) {
        return;
      }


      const room =
        rooms[selectedRoomIndex];


      const professor =
        document
          .getElementById("roomProfessor")
          .value
          .trim();


      const className =
        document
          .getElementById("roomClass")
          .value
          .trim();


      if (!professor || !className) {

        alert(
          "Please complete all fields."
        );

        return;

      }


      room.professor = professor;

      room.class = className;

      room.status = "In Use";


      saveData();

      closeRoomForm();

      showRooms();

    }
  );


/* =========================
   CLOSE ROOM FORM
========================= */

function closeRoomForm() {

  document
    .getElementById("roomBackground")
    .style.display = "none";


  selectedRoomIndex = -1;

}


/* =========================
   OPEN LABORATORY
========================= */

function openRoomByIndex(index) {

  if (rooms[index]) {

    openRoom(
      rooms[index].name
    );

  }

}


function openRoom(name) {

  selectedRoom = name;


  document
    .getElementById("homePage")
    .style.display = "none";


  document
    .getElementById("computerPage")
    .style.display = "block";


  document
    .getElementById("roomTitle")
    .textContent =
      name +
      " - Computer Laboratory";


  document
    .getElementById("search")
    .value = "";


  showComputers();

  showMaintenance();

}


function goHome() {

  document
    .getElementById("computerPage")
    .style.display = "none";


  document
    .getElementById("homePage")
    .style.display = "block";


  showRooms();

}


/* =========================
   COMPUTER RECORDS
========================= */

function showComputers() {

  const list =
    document.getElementById(
      "computerList"
    );


  const search =
    document
      .getElementById("search")
      .value
      .trim()
      .toLowerCase();


  list.innerHTML = "";


  computers.forEach(
    (computer, index) => {

      if (
        computer.room !==
        selectedRoom
      ) {
        return;
      }


      const searchableText = [

        computer.id,
        computer.processor,
        computer.ram,
        computer.storage,
        computer.status,
        computer.maintenance

      ]
        .join(" ")
        .toLowerCase();


      if (
        !searchableText.includes(search)
      ) {
        return;
      }


      list.insertAdjacentHTML(

        "beforeend",

        `
        <tr>

          <td>
            ${esc(computer.id)}
          </td>

          <td>
            ${esc(computer.processor)}
          </td>

          <td>
            ${esc(computer.ram)}
          </td>

          <td>
            ${esc(computer.storage)}
          </td>

          <td>
            ${esc(computer.status)}
          </td>

          <td>
            ${esc(computer.maintenance)}
          </td>

          <td>

            <button
              class="edit"
              onclick="editComputer(${index})">

              Edit

            </button>

            <button
              class="report"
              onclick="openProblemForm(${index})">

              Report Problem

            </button>

            <button
              class="delete"
              onclick="deleteComputer(${index})">

              Delete

            </button>

          </td>

        </tr>
        `
      );

    }
  );


  if (!list.innerHTML) {

    list.innerHTML =
      `
      <tr>
        <td colspan="7">
          No computers found in this laboratory.
        </td>
      </tr>
      `;

  }


  updateNumbers();

}


function updateNumbers() {

  const roomComputers =
    computers.filter(
      computer =>
        computer.room ===
        selectedRoom
    );


  document.getElementById(
    "total"
  ).textContent =
    roomComputers.length;


  document.getElementById(
    "available"
  ).textContent =
    roomComputers.filter(
      computer =>
        computer.status ===
        "Available"
    ).length;


  document.getElementById(
    "unavailable"
  ).textContent =
    roomComputers.filter(
      computer =>
        computer.status ===
        "Unavailable"
    ).length;


  document.getElementById(
    "maintenance"
  ).textContent =
    roomComputers.filter(
      computer =>
        [
          "For Maintenance",
          "Under Repair"
        ].includes(
          computer.maintenance
        )
    ).length;

}


/* =========================
   ADD COMPUTER
========================= */

function openAddForm() {

  editingIndex = -1;


  document.getElementById(
    "formTitle"
  ).textContent =
    "Add Computer Unit";


  document
    .getElementById("computerForm")
    .reset();


  document.getElementById(
    "status"
  ).value =
    "Available";


  document.getElementById(
    "maintenance"
  ).value =
    "Good";


  document.getElementById(
    "formBackground"
  ).style.display =
    "flex";

}


/* =========================
   EDIT COMPUTER
========================= */

function editComputer(index) {

  const computer =
    computers[index];


  if (!computer) return;


  editingIndex = index;


  document.getElementById(
    "formTitle"
  ).textContent =
    "Edit Computer Unit";


  document.getElementById(
    "computerId"
  ).value =
    computer.id;


  document.getElementById(
    "processor"
  ).value =
    computer.processor;


  document.getElementById(
    "ram"
  ).value =
    computer.ram;


  document.getElementById(
    "storage"
  ).value =
    computer.storage;


  document.getElementById(
    "status"
  ).value =
    computer.status;


  document.getElementById(
    "maintenance"
  ).value =
    computer.maintenance;


  document.getElementById(
    "formBackground"
  ).style.display =
    "flex";

}


function closeForm() {

  document.getElementById(
    "formBackground"
  ).style.display =
    "none";

}


/* =========================
   SAVE COMPUTER
========================= */

document
  .getElementById("computerForm")
  .addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const computer = {

        room: selectedRoom,

        id:
          document
            .getElementById(
              "computerId"
            )
            .value
            .trim(),

        processor:
          document
            .getElementById(
              "processor"
            )
            .value
            .trim(),

        ram:
          document
            .getElementById("ram")
            .value
            .trim(),

        storage:
          document
            .getElementById(
              "storage"
            )
            .value
            .trim(),

        status:
          document.getElementById(
            "status"
          ).value,

        maintenance:
          document.getElementById(
            "maintenance"
          ).value

      };


      if (
        ![
          computer.id,
          computer.processor,
          computer.ram,
          computer.storage
        ].every(Boolean)
      ) {

        alert(
          "Please complete all computer fields."
        );

        return;

      }


      const duplicate =
        computers.some(
          (existing, index) =>

            existing.room ===
              selectedRoom &&

            existing.id
              .toLowerCase() ===
              computer.id
                .toLowerCase() &&

            index !==
              editingIndex
        );


      if (duplicate) {

        alert(
          "That Computer ID already exists in this laboratory."
        );

        return;

      }


      if (editingIndex === -1) {

        computers.push(
          computer
        );

      } else {

        const oldId =
          computers[
            editingIndex
          ].id;


        computers[
          editingIndex
        ] = {

          ...computers[
            editingIndex
          ],

          ...computer

        };


        maintenanceRecords.forEach(
          record => {

            if (
              record.room ===
                selectedRoom &&

              record.computerId ===
                oldId
            ) {

              record.computerId =
                computer.id;

            }

          }
        );

      }


      saveData();

      closeForm();

      showComputers();

      showMaintenance();

    }
  );


/* =========================
   DELETE COMPUTER
========================= */

function deleteComputer(index) {

  const computer =
    computers[index];


  if (!computer) return;


  if (
    !confirm(
      "Delete " +
      computer.id +
      "? Related maintenance records will also be deleted."
    )
  ) {
    return;
  }


  computers.splice(
    index,
    1
  );


  maintenanceRecords =
    maintenanceRecords.filter(
      record =>
        !(
          record.room ===
            selectedRoom &&

          record.computerId ===
            computer.id
        )
    );


  saveData();

  showComputers();

  showMaintenance();

}


/* =========================
   PROBLEM REPORTING
========================= */

function openProblemForm(index) {

  const computer =
    computers[index];


  if (!computer) return;


  editingMaintenanceIndex = -1;


  document.getElementById(
    "problemFormTitle"
  ).textContent =
    "Report Computer Problem";


  document
    .getElementById("problemForm")
    .reset();


  document.getElementById(
    "problemComputerId"
  ).value =
    computer.id;


  document.getElementById(
    "dateReported"
  ).value =
    new Date()
      .toLocaleDateString(
        "en-CA"
      );


  document.getElementById(
    "reportedBy"
  ).value =
    "Teacher";


  document.getElementById(
    "problemMaintenance"
  ).value =
    "For Maintenance";


  document.getElementById(
    "problemBackground"
  ).style.display =
    "flex";

}


function closeProblemForm() {

  document.getElementById(
    "problemBackground"
  ).style.display =
    "none";

}


/* =========================
   SAVE PROBLEM REPORT
========================= */

document
  .getElementById("problemForm")
  .addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const computerId =
        document.getElementById(
          "problemComputerId"
        ).value;


      const record = {

        room: selectedRoom,

        computerId:

          computerId,

        problem:

          document
            .getElementById(
              "problemDescription"
            )
            .value
            .trim(),

        dateReported:

          document
            .getElementById(
              "dateReported"
            )
            .value,

        reportedBy:

          document
            .getElementById(
              "reportedBy"
            )
            .value,

        status:

          document
            .getElementById(
              "problemMaintenance"
            )
            .value,

        actionTaken:

          document
            .getElementById(
              "actionTaken"
            )
            .value
            .trim()

      };


      if (
        !record.problem ||
        !record.dateReported
      ) {

        alert(
          "Please enter the problem and date reported."
        );

        return;

      }


      if (
        editingMaintenanceIndex !==
        -1
      ) {

        maintenanceRecords[
          editingMaintenanceIndex
        ] = {

          ...maintenanceRecords[
            editingMaintenanceIndex
          ],

          ...record

        };

      } else {

        maintenanceRecords.push(
          record
        );

      }


      const computer =
        computers.find(
          item =>

            item.room ===
              selectedRoom &&

            item.id ===
              computerId
        );


      if (computer) {

        computer.maintenance =
          record.status;


        computer.status =
          record.status ===
            "Good"

            ? "Available"

            : "Unavailable";

      }


      saveData();

      closeProblemForm();

      showComputers();

      showMaintenance();

    }
  );


/* =========================
   MAINTENANCE TABLE
========================= */

function showMaintenance() {

  const list =
    document.getElementById(
      "maintenanceList"
    );


  list.innerHTML = "";


  maintenanceRecords.forEach(
    (record, index) => {

      if (
        record.room !==
        selectedRoom
      ) {
        return;
      }


      list.insertAdjacentHTML(

        "beforeend",

        `
        <tr>

          <td>
            ${esc(record.computerId)}
          </td>

          <td>
            ${esc(record.problem)}
          </td>

          <td>
            ${esc(record.dateReported)}
          </td>

          <td>
            ${esc(record.reportedBy)}
          </td>

          <td>
            ${esc(
              record.actionTaken ||
              "Not yet updated"
            )}
          </td>

          <td>
            ${esc(record.status)}
          </td>

          <td>

            <button
              class="edit"
              onclick="editMaintenance(${index})">

              Update

            </button>

          </td>

        </tr>
        `
      );

    }
  );


  if (!list.innerHTML) {

    list.innerHTML =
      `
      <tr>

        <td colspan="7">
          No problem or maintenance records
          for this laboratory.
        </td>

      </tr>
      `;

  }

}


/* =========================
   EDIT MAINTENANCE
========================= */

function editMaintenance(index) {

  const record =
    maintenanceRecords[index];


  if (!record) return;


  editingMaintenanceIndex =
    index;


  document.getElementById(
    "problemFormTitle"
  ).textContent =
    "Update Maintenance Record";


  document.getElementById(
    "problemComputerId"
  ).value =
    record.computerId;


  document.getElementById(
    "problemDescription"
  ).value =
    record.problem;


  document.getElementById(
    "dateReported"
  ).value =
    record.dateReported;


  document.getElementById(
    "reportedBy"
  ).value =
    record.reportedBy;


  document.getElementById(
    "problemMaintenance"
  ).value =
    record.status;


  document.getElementById(
    "actionTaken"
  ).value =
    record.actionTaken || "";


  document.getElementById(
    "problemBackground"
  ).style.display =
    "flex";

}


/* =========================
   START SYSTEM
========================= */

loadData();