import dotenv from "dotenv";
import mongoose from "mongoose";
import Registration from "../models/Registration.js";
import Payment from "../models/Payment.js";
import Feedback from "../models/Feedback.js";
import loginSeedData from "./login_seed_data.js";

dotenv.config();

const SCHOOLS = [
  "JNV Alappuzha",
  "JNV Malappuram",
  "JNV Ernakulam",
  "JNV Idukki",
  "JNV Kannur",
  "JNV Kasaragod",
  "JNV Kollam",
  "JNV Kottayam",
  "JNV Kozhikode",
  "JNV Palakkad",
  "JNV Pathanamthitta",
  "JNV Thiruvananthapuram",
  "JNV Thrissur",
  "JNV Wayanad",
];

const DISTRICTS = [
  "Ernakulam",
  "Thiruvananthapuram",
  "Kozhikode",
  "Thrissur",
  "Kollam",
  "Palakkad",
  "Malappuram",
  "Kannur",
];

const FIRST_NAMES = [
  "Arun",
  "Deepa",
  "Rahul",
  "Meera",
  "Vijay",
  "Anjali",
  "Suresh",
  "Lakshmi",
  "Manoj",
  "Priya",
  "Rajesh",
  "Sneha",
  "Anoop",
  "Divya",
  "Gopal",
  "Nisha",
  "Harish",
  "Kavya",
  "Binu",
  "Reena",
];

const LAST_NAMES = [
  "Nair",
  "Menon",
  "Pillai",
  "Kumar",
  "Das",
  "Varma",
  "Krishnan",
  "Thomas",
  "Joseph",
  "Mohanan",
];

const MODES = ["Train", "Bus", "Car", "Flight", "Bike"];
const YEARS = ["1998", "2001", "2004", "2007", "2010", "2013", "2016"];

const pick = (arr, index) => arr[index % arr.length];

const buildAttendees = (seed) => ({
  adults: { veg: (seed % 3) + 1, nonVeg: seed % 2 },
  teens: { veg: seed % 2, nonVeg: seed % 2 },
  children: { veg: seed % 2, nonVeg: 0 },
  toddlers: { veg: 0, nonVeg: 0 },
});

const buildRegistrationDoc = (index) => {
  const i = index + 1;
  const registrationType =
    i <= 30 ? "Alumni" : i <= 35 ? "Staff" : "Other";
  const firstName = pick(FIRST_NAMES, index);
  const lastName = pick(LAST_NAMES, index + 3);
  const name = `${firstName} ${lastName}`;
  const school = pick(SCHOOLS, index);
  const district = pick(DISTRICTS, index);
  const yearOfPassing = pick(YEARS, index);
  const isAttending = i !== 38 && i !== 39;
  const paymentStatus =
    i % 5 === 0 ? "pending" : i % 7 === 0 ? "partial" : "completed";

  const isAlumni = registrationType === "Alumni";
  const isProvider = isAlumni && i % 4 === 0;
  const isSeeker = isAlumni && i % 4 === 1;
  const isHotel = isAlumni && i % 4 === 2;
  const isTravelling = isAlumni && i % 3 !== 0;

  const accommodation = isProvider
    ? {
        planAccommodation: true,
        accommodation: "provide",
        accommodationCapacity: 2 + (i % 4),
        accommodationLocation: `${district} Town`,
        accommodationDistrict: district,
        accommodationState: "Kerala",
        accommodationPincode: `${680000 + i}`,
        accommodationLandmark: "Near bus stand",
        accommodationRemarks: "Demo host — spare room available",
      }
    : isSeeker
      ? {
          planAccommodation: true,
          accommodation: "need",
          accommodationNeeded: {
            male: i % 2,
            female: 1 + (i % 2),
            other: 0,
          },
          accommodationDistrict: district,
          accommodationState: "Kerala",
          accommodationGender: "mixed",
        }
      : isHotel
        ? {
            planAccommodation: true,
            accommodation: "discount-hotel",
            hotelRequirements: {
              adults: 2,
              childrenAbove11: i % 2,
              children5to11: 0,
              checkInDate: "2026-01-25",
              checkOutDate: "2026-01-27",
              roomPreference: "double",
              specialRequests: "Demo hotel booking request",
            },
          }
        : {
            planAccommodation: true,
            accommodation: "not-required",
          };

  const transportation = isTravelling
    ? {
        isTravelling: true,
        startingLocation: `${district}, Kerala`,
        startPincode: `${680000 + i}`,
        pinDistrict: district,
        pinState: "Kerala",
        travelDate: "2026-01-26",
        travelTime: "09:30",
        modeOfTransport: pick(MODES, i),
        connectWithNavodayans: "Yes",
        readyForRideShare: i % 2 === 0 ? "Yes" : "No",
        vehicleCapacity: i % 2 === 0 ? 3 + (i % 3) : 0,
        groupSize: 1 + (i % 3),
        needParking: i % 3 === 0 ? "Yes" : "No",
      }
    : { isTravelling: false };

  return {
    registrationType,
    name,
    contactNumber: `9900${String(100000 + i).slice(-6)}`,
    whatsappNumber: `9900${String(100000 + i).slice(-6)}`,
    email: `demo.${registrationType.toLowerCase()}.${String(i).padStart(2, "0")}@demo.unma.in`,
    emailVerified: true,
    paymentStatus,
    schoolsWorked: registrationType === "Staff" ? school : undefined,
    yearsOfWorking: registrationType === "Staff" ? "8" : undefined,
    currentPosition: registrationType === "Staff" ? "Teacher" : undefined,
    purpose: registrationType === "Other" ? "Guest speaker" : undefined,
    formDataStructured: {
      verification: {
        emailVerified: true,
        captchaVerified: true,
        quizPassed: true,
        email: `demo.${registrationType.toLowerCase()}.${String(i).padStart(2, "0")}@demo.unma.in`,
        contactNumber: `9900${String(100000 + i).slice(-6)}`,
      },
      personalInfo: {
        name,
        email: `demo.${registrationType.toLowerCase()}.${String(i).padStart(2, "0")}@demo.unma.in`,
        contactNumber: `9900${String(100000 + i).slice(-6)}`,
        whatsappNumber: `9900${String(100000 + i).slice(-6)}`,
        school,
        yearOfPassing,
        country: "India",
        stateUT: "Kerala",
        district,
        bloodGroup: "O+",
      },
      professional: {
        profession: ["Engineering"],
        currentPosition: "Software Engineer",
        yearsOfWorking: "5",
      },
      eventAttendance: {
        isAttending,
        attendees: buildAttendees(i),
        eventParticipation: ["Networking"],
      },
      sponsorship: {
        interestedInSponsorship: false,
        canReferSponsorship: false,
      },
      transportation,
      accommodation,
      financial: {
        willContribute: paymentStatus !== "pending",
        contributionAmount: paymentStatus === "completed" ? 500 : 200,
        paymentStatus,
      },
    },
    registrationDate: new Date(Date.now() - i * 86400000),
    lastUpdated: new Date(),
    formSubmissionComplete: true,
    step1Complete: true,
    step2Complete: true,
    step3Complete: true,
    step4Complete: true,
    step5Complete: true,
    step6Complete: true,
    step7Complete: true,
    step8Complete: true,
    currentStep: 8,
    serialNumber: 9000 + i,
    markedEntered: i % 11 === 0,
    enteredAt: i % 11 === 0 ? new Date() : undefined,
    enteredBy: i % 11 === 0 ? "demo-admin" : undefined,
    isDemoData: true,
  };
};

const clearDemoData = async () => {
  const demoRegistrations = await Registration.find({ isDemoData: true }).select(
    "_id"
  );
  const registrationIds = demoRegistrations.map((doc) => doc._id);

  await Payment.deleteMany({
    $or: [{ isDemoData: true }, { registration: { $in: registrationIds } }],
  });
  await Feedback.deleteMany({ isDemoData: true });
  await Registration.deleteMany({ isDemoData: true });

  console.log(
    `Cleared ${registrationIds.length} demo registrations and related records`
  );
};

const seedDemoData = async () => {
  const mongoURI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/unma2025";

  await mongoose.connect(mongoURI);
  console.log("Connected to MongoDB for demo seeding");

  await clearDemoData();
  await loginSeedData();

  const registrationDocs = Array.from({ length: 40 }, (_, index) =>
    buildRegistrationDoc(index)
  );

  const registrations = await Registration.insertMany(registrationDocs);
  console.log(`Inserted ${registrations.length} demo registrations`);

  const payments = [];
  for (const registration of registrations) {
    if (registration.paymentStatus === "pending") continue;

    payments.push({
      registration: registration._id,
      razorpayPaymentId: `demo_pay_${registration.serialNumber}`,
      razorpayOrderId: `demo_order_${registration.serialNumber}`,
      amount:
        registration.paymentStatus === "partial"
          ? 250
          : registration.formDataStructured?.financial?.contributionAmount ||
            500,
      currency: "INR",
      status:
        registration.paymentStatus === "completed" ? "captured" : "authorized",
      paymentMethod: "upi",
      notes: "Demo seed payment",
      isDemoData: true,
    });
  }

  if (payments.length) {
    await Payment.insertMany(payments);
    console.log(`Inserted ${payments.length} demo payments`);
  }

  const feedbackDocs = registrations.slice(0, 8).map((registration, index) => ({
    registrationId: registration._id,
    name: registration.name,
    email: registration.email,
    phone: registration.contactNumber,
    school: registration.formDataStructured?.personalInfo?.school,
    overallSatisfaction: 4 + (index % 2),
    mostEnjoyedAspect: "Networking with alumni",
    organizationRating: 4,
    sessionUsefulness: 4,
    favoriteSpeakerSession: "Keynote on community building",
    wouldRecommend: "Yes",
    improvementSuggestions: "More seating in the main hall",
    accommodationRating: 3 + (index % 3),
    accommodationFeedback: "Demo accommodation feedback",
    transportationRating: 4,
    transportationFeedback: "Ride-share coordination worked well",
    foodQualityRating: 4,
    networkingOpportunitiesRating: 5,
    venueQualityRating: 4,
    registrationProcessRating: 5,
    comparedToExpectations: "Exceeded",
    wouldAttendFuture: "Definitely",
    topAreaForImprovement: "Signage at venue",
    isDemoData: true,
  }));

  await Feedback.insertMany(feedbackDocs);
  console.log(`Inserted ${feedbackDocs.length} demo feedback records`);

  const paidAttending = registrations.filter(
    (r) =>
      r.paymentStatus === "completed" &&
      r.formDataStructured?.eventAttendance?.isAttending
  ).length;

  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

  console.log("\n--- Demo seed complete ---");
  console.log(`Admin login: ${adminEmail}`);
  console.log(
    `Password: ${process.env.ADMIN_PASSWORD || "securePassword123"}`
  );
  console.log(`Paid & attending (ID card eligible): ${paidAttending}`);
  console.log(`Sample registration id: ${registrations[0]._id}`);
  console.log("Open /demo in the frontend to start the walkthrough.\n");

  await mongoose.connection.close();
  process.exit(0);
};

seedDemoData().catch(async (error) => {
  console.error("Demo seed failed:", error);
  await mongoose.connection.close();
  process.exit(1);
});
