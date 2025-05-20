
document.addEventListener("DOMContentLoaded", () => {
const form = document.getElementById("bookingForm")
const formSteps = document.querySelectorAll(".form-step")
const progressSteps = document.querySelectorAll(".progress-step")
const progress = document.getElementById("progress")

const step1Next = document.getElementById("step1Next")
const step2Prev = document.getElementById("step2Prev")
const step2Next = document.getElementById("step2Next")
const step3Prev = document.getElementById("step3Prev")
const viewDetailsBtn = document.getElementById("viewDetails")

const confirmationModal = document.getElementById("confirmationModal")
const closeModal = document.querySelector(".close-modal")
const confirmationDetails = document.getElementById("confirmationDetails")
const confirmBookingBtn = document.getElementById("confirmBooking")

const courseSelect = document.getElementById("course")
const coursePriceDisplay = document.getElementById("coursePrice")

const stateSelect = document.getElementById("state")
const citySelect = document.getElementById("city")
const centerSelect = document.getElementById("center")

let currentStep = 1
let bookingData = {}

const cityData = {
maharashtra: ["Mumbai", "Pune", "Nagpur", "Thane"],
delhi: ["New Delhi", "North Delhi", "South Delhi", "East Delhi"],
karnataka: ["Bangalore", "Mysore", "Hubli", "Mangalore"],
tamilnadu: ["Chennai", "Coimbatore", "Madurai", "Salem"],
telangana: ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad"],
}

const centerData = {
Mumbai: ["Andheri Center", "Dadar Center", "Borivali Center"],
Pune: ["FC Road Center", "Hinjewadi Center", "Kothrud Center"],
Bangalore: ["Koramangala Center", "Whitefield Center", "Jayanagar Center"],
Chennai: ["T Nagar Center", "Anna Nagar Center", "Velachery Center"],
Hyderabad: ["Ameerpet Center", "Hitech City Center", "Secunderabad Center"],
"New Delhi": ["Connaught Place Center", "Rajouri Garden Center", "Lajpat Nagar Center"],
}

const defaultCenters = ["Main Center", "Downtown Center", "Suburban Center"]

function init() {
updateProgress()
setupEventListeners()
}

function updateProgress() {
progressSteps.forEach((step, idx) => {
step.classList.toggle("active", idx < currentStep)
})
progress.style.width = `${((currentStep - 1) / (progressSteps.length - 1)) * 100}%`
}

function goToStep(step) {
formSteps.forEach((formStep, idx) => {
formStep.classList.toggle("active", idx === step - 1)
})
currentStep = step
updateProgress()
form.scrollIntoView({ behavior: "smooth" })
}

function setupEventListeners() {
step1Next.addEventListener("click", () => validateStep(1) && goToStep(2))
step2Prev.addEventListener("click", () => goToStep(1))
step2Next.addEventListener("click", () => validateStep(2) && goToStep(3))
step3Prev.addEventListener("click", () => goToStep(2))

courseSelect.addEventListener("change", updateCoursePrice)
stateSelect.addEventListener("change", populateCities)
citySelect.addEventListener("change", populateCenters)
viewDetailsBtn.addEventListener("click", showConfirmationModal)
closeModal.addEventListener("click", () => (confirmationModal.style.display = "none"))
confirmBookingBtn.addEventListener("click", submitForm)

window.addEventListener("click", (event) => {
if (event.target === confirmationModal) {
confirmationModal.style.display = "none"
}
})

form.addEventListener("submit", (e) => {
e.preventDefault()
if (validateStep(3)) {
submitForm()
}
})
}

function validateStep(step) {
let isValid = true
const requiredFields = {
1: ["batchType", "course", "sessionDate", "sessionDays", "sessionTime"],
2: ["phone"],
3: ["firstName", "lastName", "email", "address", "state", "city", "center"],
}[step]

requiredFields.forEach((field) => {
const element = document.getElementById(field)
if (!element.value) {
markInvalid(element)
isValid = false
} else {
markValid(element)
}
})

if (step === 2) {
const phoneInput = document.getElementById("phone")
if (!phoneInput.value.match(/^[0-9]{10}$/)) {
markInvalid(phoneInput)
isValid = false
}
}

if (step === 3) {
const emailInput = document.getElementById("email")
if (!emailInput.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
markInvalid(emailInput)
isValid = false
}
}

if (!isValid) {
alert("Please fill in all required fields correctly.")
}

return isValid
}

function markInvalid(element) {
element.style.borderColor = "red"
}

function markValid(element) {
element.style.borderColor = "#eee"
}

function updateCoursePrice() {
const prices = {
gre: "INR 62999.00",
gmat: "INR 69999.00",
sat: "INR 59199.00",
}
coursePriceDisplay.textContent = prices[courseSelect.value] || "INR 56199.00"
}

function populateCities() {
citySelect.innerHTML = '<option value="" disabled selected></option>'
const cities = cityData[stateSelect.value] || []
cities.forEach((city) => {
const option = document.createElement("option")
option.value = city.toLowerCase()
option.textContent = city
citySelect.appendChild(option)
})
}

function populateCenters() {
centerSelect.innerHTML = '<option value="" disabled selected></option>'
const selectedCity = citySelect.options[citySelect.selectedIndex].text
const centers = centerData[selectedCity] || defaultCenters
centers.forEach((center) => {
const option = document.createElement("option")
option.value = center.toLowerCase().replace(/\s+/g, "-")
option.textContent = center
centerSelect.appendChild(option)
})
}

function showConfirmationModal() {
if (validateStep(3)) {
updateBookingData()
const detailsHTML = `
        <p><strong>Batch Type:</strong> ${bookingData.batchType}</p>
        <p><strong>Course:</strong> ${bookingData.course}</p>
        <p><strong>Session Date:</strong> ${bookingData.sessionDate}</p>
        <p><strong>Session Days:</strong> ${bookingData.sessionDays}</p>
        <p><strong>Session Time:</strong> ${bookingData.sessionTime}</p>
        <p><strong>Course Price:</strong> ${bookingData.coursePrice}</p>
        <p><strong>Phone:</strong> ${bookingData.phone}</p>
        <p><strong>Name:</strong> ${bookingData.firstName} ${bookingData.lastName}</p>
        <p><strong>Email:</strong> ${bookingData.email}</p>
        <p><strong>Address:</strong> ${bookingData.address}</p>
        <p><strong>State:</strong> ${bookingData.state}</p>
        <p><strong>City:</strong> ${bookingData.city}</p>
        <p><strong>Center:</strong> ${bookingData.center}</p>
    `
confirmationDetails.innerHTML = detailsHTML
confirmationModal.style.display = "flex"
}
}

function updateBookingData() {
bookingData = {
batchType: document.getElementById("batchType").value,
course: document.getElementById("course").value,
sessionDate: document.getElementById("sessionDate").value,
sessionDays: document.getElementById("sessionDays").value,
sessionTime: document.getElementById("sessionTime").value,
coursePrice: coursePriceDisplay.textContent,
phone: document.getElementById("phone").value,
firstName: document.getElementById("firstName").value,
lastName: document.getElementById("lastName").value,
email: document.getElementById("email").value,
address: document.getElementById("address").value,
state: document.getElementById("state").value,
city: document.getElementById("city").value,
center: document.getElementById("center").value,
}
}

// function submitForm() {
// // alert("Booking submitted successfully! We will contact you shortly.")
// confirmationModal.style.display = "none"
// form.reset()
// goToStep(1)
// }


init()
})
