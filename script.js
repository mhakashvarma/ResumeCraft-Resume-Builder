
// =====================================
// RESUME BUILDER - MAIN JAVASCRIPT
// =====================================

const fields = [
    "name",
    "email",
    "phone",
    "title",
    "objective",
    "college",
    "degree",
    "year",
    "skills",
    "projects",
    "experience"
];

const placeholders = {
    name: "Your Name",
    email: "Email Address",
    phone: "Phone Number",
    title: "Professional Title",
    objective: "Your career objective will appear here.",
    college: "College Name",
    degree: "Degree",
    year: "Graduation Year",
    skills: "Your skills will appear here.",
    projects: "Your projects will appear here.",
    experience: "Your experience will appear here."
};

const STORAGE_KEY = "resumeCraftData";

// =====================================
// LIVE RESUME PREVIEW
// =====================================

fields.forEach(field => {

    const input = document.getElementById(field);

    input.addEventListener("input", () => {

        updatePreview(field);

        // Automatically save changes
        saveToBrowser();

    });

});

function updatePreview(field) {

    const input = document.getElementById(field);
    const preview = document.getElementById("p-" + field);

    preview.textContent = input.value.trim()
        ? input.value
        : placeholders[field];

}

// =====================================
// TEMPLATE SWITCHING
// =====================================

const templateSelect = document.getElementById("templateSelect");
const resume = document.getElementById("resume");

templateSelect.addEventListener("change", function () {

    resume.classList.remove(
        "template1",
        "template2",
        "template3"
    );

    resume.classList.add(this.value);

    saveToBrowser();

});

resume.classList.add("template1");

// =====================================
// GET RESUME DATA
// =====================================

function getResumeData() {

    const data = {};

    fields.forEach(field => {
        data[field] = document.getElementById(field).value;
    });

    data.template = templateSelect.value;

    return data;
}

// =====================================
// APPLY RESUME DATA
// =====================================

function applyResumeData(data) {

    fields.forEach(field => {

        if (
            Object.prototype.hasOwnProperty.call(data, field) &&
            typeof data[field] === "string"
        ) {

            document.getElementById(field).value = data[field];

            updatePreview(field);

        }

    });

    const validTemplates = [
        "template1",
        "template2",
        "template3"
    ];

    if (validTemplates.includes(data.template)) {

        templateSelect.value = data.template;

        resume.classList.remove(
            "template1",
            "template2",
            "template3"
        );

        resume.classList.add(data.template);

    }

}

// =====================================
// SAVE TO BROWSER
// =====================================

function saveToBrowser() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(getResumeData())
        );

    } catch (error) {

        console.error("Unable to save resume:", error);

    }

}

// =====================================
// MANUAL SAVE BUTTON
// =====================================

document.getElementById("saveBtn").addEventListener("click", () => {

    try {

        saveToBrowser();

        alert("Resume saved successfully!");

    } catch (error) {

        alert("Unable to save resume.");

    }

});

// =====================================
// AUTOMATICALLY LOAD SAVED DATA
// =====================================

function loadFromBrowser() {

    try {

        const savedData = localStorage.getItem(STORAGE_KEY);

        if (savedData) {

            const data = JSON.parse(savedData);

            applyResumeData(data);

            console.log("Previous resume restored.");

        }

    } catch (error) {

        console.error("Unable to load saved resume:", error);

    }

}

// =====================================
// EXPORT RESUME AS JSON
// =====================================

document.getElementById("exportJsonBtn")
    .addEventListener("click", () => {

        const data = getResumeData();

        const jsonFile = new Blob(
            [JSON.stringify(data, null, 4)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(jsonFile);

        const link = document.createElement("a");

        link.href = url;
        link.download = "my-resume-data.json";

        link.click();

        URL.revokeObjectURL(url);

    });

// =====================================
// IMPORT RESUME FROM JSON
// =====================================

const importBtn = document.getElementById("importJsonBtn");
const importFile = document.getElementById("importFile");

importBtn.addEventListener("click", () => {

    importFile.click();

});

importFile.addEventListener("change", async () => {

    const file = importFile.files[0];

    if (!file) return;

    try {

        if (file.size > 1024 * 1024) {
            throw new Error("File is too large. Maximum size is 1 MB.");
        }

        const text = await file.text();

        const data = JSON.parse(text);

        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {
            throw new Error("Invalid resume file.");
        }

        const validTemplates = [
            "template1",
            "template2",
            "template3"
        ];

        const hasResumeField = fields.some(field =>
            Object.prototype.hasOwnProperty.call(data, field)
        );

        if (!hasResumeField) {
            throw new Error("No resume information found.");
        }

        applyResumeData(data);

        saveToBrowser();

        alert("Resume imported successfully!");

    } catch (error) {

        alert("Import failed: " + error.message);

    }

    importFile.value = "";

});

// =====================================
// EXPORT PDF
// =====================================

function downloadResume() {

    window.print();

}

// =====================================
// START APPLICATION
// =====================================

loadFromBrowser();


// =====================================
// DRAG AND DROP RESUME SECTIONS
// =====================================

const resumeContent = document.querySelector(".resume-content");

let draggedSection = null;

const sections = document.querySelectorAll(
    ".resume-section[draggable='true']"
);

sections.forEach(section => {

    section.addEventListener("dragstart", () => {
        draggedSection = section;
        section.classList.add("dragging");
    });

    section.addEventListener("dragend", () => {
        section.classList.remove("dragging");
        draggedSection = null;
        saveToBrowser();
    });

    section.addEventListener("dragover", event => {
        event.preventDefault();
    });

    section.addEventListener("drop", event => {

        event.preventDefault();

        if (!draggedSection || draggedSection === section) {
            return;
        }

        const rect = section.getBoundingClientRect();

        const insertAfter =
            event.clientY > rect.top + rect.height / 2;

        if (insertAfter) {
            section.after(draggedSection);
        } else {
            section.before(draggedSection);
        }

        saveToBrowser();

    });

});

// Save the order of sections
const originalGetResumeData = getResumeData;

getResumeData = function () {

    const data = originalGetResumeData();

    data.sectionOrder = Array.from(
        resumeContent.querySelectorAll(".resume-section")
    ).map(section => section.id);

    return data;

};

// Restore the saved section order
const originalApplyResumeData = applyResumeData;

applyResumeData = function (data) {

    originalApplyResumeData(data);

    if (Array.isArray(data.sectionOrder)) {

        const sectionMap = new Map(
            Array.from(
                resumeContent.querySelectorAll(".resume-section")
            ).map(section => [section.id, section])
        );

        data.sectionOrder.forEach(id => {

            if (sectionMap.has(id)) {
                resumeContent.appendChild(sectionMap.get(id));
            }

        });

    }

};
