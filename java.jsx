const fineAmounts = {
  "No Helmet": 100,
  "Triple Riding": 500,
  "Mobile Usage": 1000,
  "Overspeed": 400,
  "Wrong Route": 300,
  "Minor Riding": 2000
};

let capturedImage = null;
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { video.srcObject = stream; })
  .catch(err => {
    console.error("Camera not available", err);
    document.querySelector("video").style.display = "none";
  });

function capturePhoto() {
  canvas.style.display = "block";
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0);
  capturedImage = canvas.toDataURL("image/png");
  alert("Photo captured!");
}

function submitViolation() {
  const number = document.getElementById("vehicleNumber").value.trim().toUpperCase();
  const type = document.getElementById("violationType").value;
  const district = document.getElementById("district").value;
  const uploadFile = document.getElementById("photoUpload").files[0];

  if (!number || !type || (!uploadFile && !capturedImage)) {
    alert("Fill all fields and provide a photo!");
    return;
  }

  if (uploadFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      saveViolation(number, type, e.target.result, district);
    };
    reader.readAsDataURL(uploadFile);
  } else {
    saveViolation(number, type, capturedImage, district);
  }
}

function saveViolation(number, type, image, district) {
  const violation = {
    id: "APV-" + Date.now().toString().slice(-6),
    number,
    type,
    fine: fineAmounts[type],
    photo: image,
    district: district || "Not Selected",
    time: new Date().toLocaleString()
  };

  let data = JSON.parse(localStorage.getItem("violations")) || [];
  data.push(violation);
  localStorage.setItem("violations", JSON.stringify(data));
  displayViolations();
  alert("Violation reported successfully!");

  // reset form
  document.getElementById("vehicleNumber").value = "";
  document.getElementById("district").value = "";
  document.getElementById("violationType").value = "";
  document.getElementById("photoUpload").value = "";
  canvas.style.display = "none";
  capturedImage = null;
}

function displayViolations() {
  const list = document.getElementById("violationList");
  list.innerHTML = "";
  const data = JSON.parse(localStorage.getItem("violations")) || [];
  data.forEach((v, index) => {
    list.innerHTML += `
      <div class="violation">
        <img src="${v.photo}" />
        <div class="details">
          <p><strong>Vehicle:</strong> ${v.number}</p>
          <p><strong>Violation:</strong> ${v.type}</p>
          <p><strong>District:</strong> ${v.district}</p>
          <p><strong>Fine:</strong> ₹${v.fine}</p>
          <p><strong>Time:</strong> ${v.time}</p>
          <button class="download-btn" onclick="downloadSlip(${index})">Download Slip</button>
        </div>
      </div>
    `;
  });
}

function downloadSlip(index) {
  const data = JSON.parse(localStorage.getItem("violations"))[index];
  const slip = `
Andhra Pradesh Police Department
-------------------------------
🚦 Traffic Violation Slip 🚦

Violation ID   : ${data.id}
Vehicle Number : ${data.number}
Violation Type : ${data.type}
Fine Amount    : ₹${data.fine}
District       : ${data.district}
Date & Time    : ${data.time}

Verified by    : _____________ (Traffic Officer)

✅ This is an auto-generated report from the Traffic Guardian System.
  `;
  const blob = new Blob([slip], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${data.number}_Slip.txt`;
  link.click();
}

function searchViolations() {
  const query = document.getElementById("searchBox").value.toUpperCase();
  const cards = document.querySelectorAll(".violation");
  const data = JSON.parse(localStorage.getItem("violations")) || [];
  cards.forEach((card, index) => {
    const match = data[index].number.includes(query);
    card.style.display = match ? "block" : "none";
  });
}

function updateClock() {
  document.getElementById("clock").innerText = new Date().toLocaleString();
}
setInterval(updateClock, 1000);
window.onload = displayViolations;