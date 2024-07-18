document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
        apiKey: "AIzaSyCkNbO0svMGVAFTqLetz_jId280wdJTO1Q",
        authDomain: "rival-inscription.firebaseapp.com",
        projectId: "rival-inscription",
        storageBucket: "rival-inscription.appspot.com",
        messagingSenderId: "158176311282",
        appId: "1:158176311282:web:99f2fada129d433e825d6b"
    };
    
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const storage = firebase.storage();


    const prevButtons = document.querySelectorAll('.prev-button');
    const nextButtons = document.querySelectorAll('.next-button');
    const progressBarSteps = document.querySelectorAll('.progress-bar .step');
    const formSteps = document.querySelectorAll('.form-step');
    const error_div = document.querySelector('.error-div');
    const education = document.getElementById('education');
    const speciality = document.querySelector('.Spécialité');
    let currentStep = 0;


    // Add CSS for error highlighting
    const style = document.createElement('style');
    style.textContent = `
        .error {
            border: 2px solid red !important;
        }
    `;
    document.head.appendChild(style);

    function validateStep(step) {
        const inputs = step.querySelectorAll('input, select');
        let isValid = true;
        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
        return isValid;
    }

    nextButtons.forEach((button) => {
        button.addEventListener('click', () => {
            if (validateStep(formSteps[currentStep])) {
                formSteps[currentStep].classList.remove('active');
                progressBarSteps[currentStep].classList.remove('active');
                currentStep++;
                formSteps[currentStep].classList.add('active');
                progressBarSteps[currentStep].classList.add('active');
                error_div.classList.add('hidden');
            } else {
                error_div.innerHTML = 'Please fill in all required fields before proceeding.';
                error_div.classList.remove('hidden');
            }
        });
    });

    prevButtons.forEach((button) => {
        button.addEventListener('click', () => {
            formSteps[currentStep].classList.remove('active');
            progressBarSteps[currentStep].classList.remove('active');
            currentStep--;
            formSteps[currentStep].classList.add('active');
            progressBarSteps[currentStep].classList.add('active');
        });
    });
    //trigger education change
    education.addEventListener('change', () => {
        console.log("education changed");
        if (education.value === 'universite') {
            speciality.classList.remove('hidden');
        } else {
            speciality.classList.add('hidden');
        }
    });
    // Image preview 
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photo-preview');
    photoInput.addEventListener('change', () => previewImage(photoInput, photoPreview));

    const idCardInput = document.getElementById('id-card');
    const idCardPreview = document.getElementById('id-card-preview');
    idCardInput.addEventListener('change', () => previewImage(idCardInput, idCardPreview));

    const birthCertificateInput = document.getElementById('birth-certificate');
    const birthCertificatePreview = document.getElementById('birth-certificate-preview');
    birthCertificateInput.addEventListener('change', () => previewImage(birthCertificateInput, birthCertificatePreview));

    function previewImage(input, preview) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    }

        
    const form = document.getElementById('multi-step-form');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(form);
        const data = { fields: [] };
        const fileFields = ['photo_d_identite', 'photo_carte_d_identite', 'extrait_de_naissance'];
        const uploadPromises = [];

        formData.forEach((value, key) => {
            if (fileFields.includes(key) && value instanceof File) {
                const storageRef = storage.ref().child('uploads/' + value.name);
                const uploadTask = storageRef.put(value)
                    .then(snapshot => snapshot.ref.getDownloadURL())
                    .then(downloadURL => {
                        data.fields.push({ name: key, value: downloadURL });
                    });
                uploadPromises.push(uploadTask);
            } else {
                data.fields.push({ name: key, value: value });
            }
        });
        console.log(data);

        try {
            await Promise.all(uploadPromises);
            await submitToHubSpot(data);
        } catch (error) {
            console.error('Error:', error);
        }
    });

    async function submitToHubSpot(data) {
        const hubspotFormId = '7c9c8e37-770c-4bd5-a9ee-09a0fdaf81aa';
        const portalId = '144724345';
        const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${hubspotFormId}`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                document.getElementById('success-message').classList.remove('hidden');
                document.getElementById('multi-step-form').classList.add('hidden');
                // setTimeout(() => {
                //    window.location.reload();
                // }, 7000);
            }else {
                console.error('Error:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
});