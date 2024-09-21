document.addEventListener("DOMContentLoaded", () => {
  const firebaseConfig = {
    apiKey: "AIzaSyBa58vxl-GFak2t7aTFCTmwq4Q8NqBJPjs",
    authDomain: "rival-inscription-c7706.firebaseapp.com",
    projectId: "rival-inscription-c7706",
    storageBucket: "rival-inscription-c7706.appspot.com",
    messagingSenderId: "965871338765",
    appId: "1:965871338765:web:35c4fb2b17627175e45c44",
    databaseURL:
      "https://rival-inscription-c7706-default-rtdb.europe-west1.firebasedatabase.app",
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const storage = firebase.storage();
  const database = firebase.database();

  function getMatricule(campus) {
    return new Promise((resolve, reject) => {
      const matriculeRef = database.ref(`matricule-${campus}`);
      matriculeRef.once(
        "value",
        (snapshot) => {
          if (snapshot.exists()) {
            resolve(snapshot.val());
          } else {
            reject(new Error("Matricule not found"));
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
  function incrementMatricule(campus) {
    const matriculeRef = database.ref(`matricule-${campus}`);
    return matriculeRef.transaction((currentValue) => {
      return (currentValue || 0) + 1;
    });
  }
  const prevButtons = document.querySelectorAll(".prev-button");
  const nextButtons = document.querySelectorAll(".next-button");
  const progressBarSteps = document.querySelectorAll(".progress-bar .step");
  const formSteps = document.querySelectorAll(".form-step");
  const error_div = document.querySelector(".error-div");
  const education = document.getElementById("education");
  const speciality = document.querySelector(".Spécialité");
  const loadingOverlay = document.getElementById("loading-overlay");
  const lacalSelection = document.querySelector(".no-local-overlay ");
  const diplomePopup = document.querySelector(".diplome-popup");
  const attDiv = document.querySelector(".attDiv");
  const attChips = document.querySelectorAll(".attestation .chip");
  const demarchesErr= document.querySelector(".demarchesErr");
  const attErr= document.querySelector(".att");
  const demarchesChips = document.querySelectorAll(".demarches .chip");
  const closePopupButton = document.querySelector(".close-popup");
  const dropDownFormation = document.querySelector(".dropbtn");
  const formationList = document.querySelector(".formations-popup");
  const closeFormation = document.querySelector(".fa-xmark");
  const form = document.getElementById("multi-step-form");
  const selectedFormationsDiv = document.getElementById("selectedFormations");
      // Get all checkboxes with name 'formation[]'
      const formationCheckboxes = formationList.querySelectorAll('input[type="checkbox"][name="formation[]"]');

  dropDownFormation.addEventListener("click", (e) => {
    e.preventDefault();
    formationList.classList.remove("hidden");
    // formationDropDown.classList.remove("hidden");
  });
  closeFormation.addEventListener(
    "click",
    () => formationList.classList.add("hidden")
    // formationDropDown.classList.add("hidden")
  );

  let currentStep = 0;

  // campus
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let campus = urlParams.get("local");
  if (campus != null) {
    campus = campus.toUpperCase();
    lacalSelection.classList.add("hidden");
  } else {
    lacalSelection.classList.remove("hidden");
  }

  function validateStep(formStep, step) {
    const inputs = formStep.querySelectorAll(
      'input[type="text"], input[type="tel"], input[type="date"], input[type="email"], select , input[type="file"]'
    );
    const selectedFormations = Array.from(formationCheckboxes).filter(checkbox => checkbox.checked);
    const isAideSoignant = selectedFormations.length === 1 && selectedFormations[0].value === 'Aide Soignant(e)';
    const isValid = Array.from(inputs).every((input) => {
      const isOptional = ["specialite", "annee_d_etude","hs_whatsapp_phone_number"].includes(input.name);
      const isEmpty = !input.value.trim();
      input.classList.toggle("error", !isOptional && isEmpty);
      return isOptional || !isEmpty;
    });

    if (step === 1) {
      const isAttestationValid = attestation !== "aucun" || isAideSoignant;
      const isDemarchesValid = demarches !== "";
      attErr.classList.toggle("error", !isAttestationValid);
      demarchesErr.classList.toggle("error", !isDemarchesValid);
      return isValid && isAttestationValid && isDemarchesValid;
    }

    
  if (step === 0) {

    
    // Check if any checkbox is checked
    if (isAideSoignant) {
      attDiv.classList.add('hidden');
    } else {
      attDiv.classList.remove('hidden');
    }
    
    const isFormationValid = selectedFormations.length > 0;
    dropDownFormation.classList.toggle('error', !isFormationValid);
    return isValid && isFormationValid;
  }
  if(step === 2){
    const isCarteValid = document.getElementById("id-card").files.length > 0;
    const isPhotoValid = document.getElementById("photo").files.length > 0;

    return isValid && isCarteValid && isPhotoValid;
  }

    return isValid;
  }

  nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (validateStep(formSteps[currentStep], currentStep)) {
        formSteps[currentStep].classList.remove("active");
        progressBarSteps[currentStep].classList.remove("active");
        currentStep++;
        formSteps[currentStep].classList.add("active");
        progressBarSteps[currentStep].classList.add("active");
        error_div.classList.add("hidden");
      } else {
        error_div.innerHTML =
          "Veuillez remplir tous les champs obligatoires avant de continuer.";
        error_div.classList.remove("hidden");
      }
    });
  });

  prevButtons.forEach((button) => {
    button.addEventListener("click", () => {
      formSteps[currentStep].classList.remove("active");
      progressBarSteps[currentStep].classList.remove("active");
      currentStep--;
      formSteps[currentStep].classList.add("active");
      progressBarSteps[currentStep].classList.add("active");
    });
  });
  //trigger education change
  education.addEventListener("change", () => {
    if (education.value === "Université") {
      speciality.classList.remove("hidden");
    } else {
      speciality.classList.add("hidden");
    }
  });
  //attestation selection
  let attestation = "aucun";
  let demarches = "";

  attChips.forEach((chip) => {
    chip.addEventListener("click", function () {
      attChips.forEach((c) => c.classList.remove("selected"));
      this.classList.add("selected");
      attestation = this.dataset.value;
      if (attestation === "Diplome") {
        diplomePopup.classList.remove("hidden");
      }
      // You can use the selectedValue variable to store or process the selection
    });
  });
  //demarches selection
  demarchesChips.forEach((chip) => {
    chip.addEventListener("click", function () {
      demarchesChips.forEach((c) => c.classList.remove("selected"));
      this.classList.add("selected");
      demarches = this.dataset.value;
      // You can use the selectedValue variable to store or process the selection
    });
  });
  closePopupButton.addEventListener("click", function () {
    diplomePopup.classList.add("hidden");
  });
  // Image preview

  const idCardInput = document.getElementById("id-card");
  const idCardPreview = document.getElementById("id-card-preview");
  const photoInput = document.getElementById("photo");
  const phtoPreview = document.getElementById("photo-preview");
  photoInput.addEventListener("change", () =>
    previewImage(photoInput, phtoPreview)
  );
  idCardInput.addEventListener("change", () =>
    previewImage(idCardInput, idCardPreview)
  );

  function previewImage(input, preview) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  }

  //formation selection
  const checkboxes = document.querySelectorAll(
    'input[type="checkbox"][name="formation[]"]'
  );

  checkboxes.forEach((checkbox) => {
    //hide selectedFormationsDiv if no formation selected
    checkbox.addEventListener("change", function () {
      if (
        document.querySelectorAll(
          'input[type="checkbox"][name="formation[]"]:checked'
        ).length > 0
      ) {
        selectedFormationsDiv.classList.remove("hidden");
      } else {
        selectedFormationsDiv.classList.add("hidden");
      }
      updateSelectedFormations();
    });
  });

  function updateSelectedFormations() {
    selectedFormationsDiv.innerHTML = "";
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const formationSpan = document.createElement("span");
        formationSpan.className = "selected-formation-item";
        formationSpan.textContent = checkbox.nextElementSibling.textContent;
        selectedFormationsDiv.appendChild(formationSpan);
      }
    });
  }

  //matricule
  function formatMatricule(matricule) {
    // Get the current date
    const currentDate = new Date();

    // Extract the last two digits of the current year
    const yearPart = currentDate.getFullYear().toString().slice(-2);

    // Get the current month (padded to two digits if necessary)
    const monthPart = (currentDate.getMonth() + 1).toString().padStart(2, "0");

    // Pad the matricule to four digits
    const matriculePart = matricule.toString().padStart(4, "0");

    // Combine all parts to create the formatted matricule
    return `RVL-${yearPart}${monthPart}${campus[0]}${matriculePart}`;
  }
  //form submission

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    loadingOverlay.classList.remove("hidden");
    const formData = new FormData(form);
    const data = { fields: [] };
    const uploadPromises = [];
    formData.delete("rules");

    formData.forEach((value, key) => {
      if (key == "carte_d_identite" || key == "photo_id") {
        const storageRef = storage.ref().child("uploads/" + value.name);
        const uploadTask = storageRef
          .put(value)
          .then((snapshot) => snapshot.ref.getDownloadURL())
          .then((downloadURL) => {
            data.fields.push({ name: key, value: downloadURL });
          });
        uploadPromises.push(uploadTask);
      } else {
        data.fields.push({ name: key, value: value });
      }
    });

    const matricule = await getMatricule(campus);
    const baseData = {
      Campus: campus,
      Copier: false,
      Matricule: formatMatricule(matricule),
      "Nom & Prénom": formData.get("lastname"),
      "N° De Tel": formData.get("phone"),
      "Date d'inscription": new Date().toLocaleDateString("fr-FR"),
      "Attestation/Diplome": attestation,
      Demarches: demarches,
      "N° De Whatssap":formData.get("hs_whatsapp_phone_number"),
      "Lieu de naissance":formData.get("lieu_de_naissance"),
    };

    const selectedFormations = Array.from(formationCheckboxes).filter(checkbox => checkbox.checked).map(cb => cb.value);
    const dataArray = [];
    if (selectedFormations.length > 0) {
      selectedFormations.forEach((formation) => {
        const rowData = {
          Formation: formation,
          ...baseData,
        };
        dataArray.push(rowData);
        data.fields.push({ name: "formation[]", value: formation });
      });
    } else {
      const rowData = {
        Formation: "",
        ...baseData,
      };
      dataArray.push(rowData);
    }
    try {
      await Promise.all(uploadPromises);
      console.log(data);
      console.log(dataArray);
      await submitToHubSpot(data);
      for (const data of dataArray) {
        await submitToGoogleSheets(data);
      }
      incrementMatricule(campus);
      loadingOverlay.classList.add("hidden");
      document.getElementById("success-message").classList.remove("hidden");
      document.getElementById("multi-step-form").classList.add("hidden");
      // setTimeout(() => {
      //   window.location.reload();
      // }, 5000);
    } catch (error) {
      console.error("Error:", error);
      loadingOverlay.classList.add("hidden");
    }
  });

  async function submitToGoogleSheets(data) {
    const scriptUrl =
      "https://script.google.com/macros/s/AKfycbyp4cE-5CKcC4c23q1ejxwniAkNnuHYkLOzk4QV0BRS96W8MR1l9XBa2woYS03gLXsN/exec";

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors",
      body: JSON.stringify(data),
    });
  }

  async function submitToHubSpot(data) {
    const hubspotFormId = "b6d3eeb2-4533-489d-b826-dfcefa717cc2";
    const portalId = "44747343";
    const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${hubspotFormId}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }
});
