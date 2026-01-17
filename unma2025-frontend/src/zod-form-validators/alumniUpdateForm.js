import { z } from "zod";

// Validation schema for alumni update form
export const AlumniUpdateSchema = z.object({
    personalInfo: z.object({
        name: z.string().min(2, "Name is required"),
        email: z.string().email("Valid email is required"),
        contactNumber: z.string().min(1, "Contact number is required"),
        whatsappNumber: z.string().optional(),
        school: z.string().min(1, "School selection is required"),
        yearOfPassing: z.string().min(4, "Year of passing is required"),
        country: z.string().optional(),
        stateUT: z.string().optional(),
        district: z.string().optional(),
        bloodGroup: z.string().optional(),
    }),

    professional: z.object({
        profession: z.array(z.string()).optional(),
        professionalDetails: z.string().optional(),
        areaOfExpertise: z.string().optional(),
        keySkills: z.string().optional(),
    }),

    eventAttendance: z.object({
        isAttending: z.boolean().optional(),
        eventParticipation: z.array(z.string()).optional(),
        participationDetails: z.string().optional(),
    }),

    transportation: z.object({
        isTravelling: z.boolean().optional(),
        startingLocation: z.string().optional(),
        travelDate: z.string().optional(),
        travelTime: z.string().optional(),
        modeOfTransport: z.string().optional(),
        travelSpecialRequirements: z.string().optional(),
    }),

    accommodation: z.object({
        planAccommodation: z.boolean().optional(),
        accommodation: z.string().optional(),
        accommodationLocation: z.string().optional(),
        accommodationRemarks: z.string().optional(),
    }),

    optional: z.object({
        spouseNavodayan: z.string().optional(),
        unmaFamilyGroups: z.string().optional(),
        mentorshipOptions: z.array(z.string()).optional(),
        trainingOptions: z.array(z.string()).optional(),
        seminarOptions: z.array(z.string()).optional(),
        tshirtInterest: z.string().optional(),
    }),
}); 