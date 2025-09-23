'use client'

import React from "react";

type AttendeeType = "professional" | "student";

interface ProfessionalDetails {
    firstName: string;
    lastName: string;
    attendeeType: "professional";
    organization: string;
    role: string;
}

interface StudentDetails {
    firstName: string;
    lastName: string;
    attendeeType: "student";
    institute: string;
    studyProgram: string;
    graduationDate: string;
}

export type PersonalDetails = ProfessionalDetails | StudentDetails;

interface PersonalDetailsFormProps {
    details: PersonalDetails;
    setDetails: React.Dispatch<React.SetStateAction<PersonalDetails>>;
    disabled: boolean;
    children?: React.ReactNode;
}

export default function PersonalDetailsForm({ details, setDetails, disabled, children }: PersonalDetailsFormProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    const handleAttendeeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const attendeeType = e.target.value as AttendeeType;
        setDetails({
            firstName: details.firstName || "",
            lastName: details.lastName || "",
            attendeeType,
            ...(attendeeType === "professional"
                ? { organization: "", role: "" }
                : { institute: "", studyProgram: "", graduationDate: "" })
        } as PersonalDetails);
    };

    return (
        <div className="card h-100 shadow-sm mt-3">
            <div className="card-header text-center"><h3>Tell us a bit about yourself</h3></div>
            <div className="card-body text-center mx-5">

                <div className="form-group mb-3 text-start">
                    <label htmlFor="firstName" className="form-label">First name<span className="text-danger">*</span></label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={details.firstName}
                        onChange={handleChange}
                        maxLength={50}
                        required
                        className="form-control"
                        disabled={disabled}
                    />
                </div>
                <div className="form-group mb-3 text-start">
                    <label htmlFor="lastName" className="form-label">Last name<span className="text-danger">*</span></label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={details.lastName}
                        onChange={handleChange}
                        maxLength={50}
                        required
                        className="form-control"
                        disabled={disabled}
                    />
                </div>
                <div className="form-group mb-3 text-start">
                    <label htmlFor="attendeeType" className="form-label">I am a<span className="text-danger">*</span></label>
                    <select
                        id="attendeeType"
                        name="attendeeType"
                        value={details.attendeeType || ""}
                        onChange={handleAttendeeTypeChange}
                        required
                        className="form-control"
                        disabled={disabled}
                    >
                        <option value="">Select...</option>
                        <option value="professional">Professional</option>
                        <option value="student">Student</option>
                    </select>
                </div>
                {details.attendeeType === "professional" && (
                    <>
                        <div className="form-group mb-3 text-start">
                            <label htmlFor="organization" className="form-label">Organization / Company<span className="text-danger">*</span></label>
                            <input
                                type="text"
                                id="organization"
                                name="organization"
                                value={(details as ProfessionalDetails).organization}
                                onChange={handleChange}
                                maxLength={50}
                                required
                                className="form-control"
                                disabled={disabled}
                            />
                        </div>
                        <div className="form-group mb-3 text-start">
                            <label htmlFor="role" className="form-label">Your role or job title<span className="text-danger">*</span></label>
                            <input
                                type="text"
                                id="role"
                                name="role"
                                value={(details as ProfessionalDetails).role}
                                onChange={handleChange}
                                maxLength={50}
                                required
                                className="form-control"
                                disabled={disabled}
                            />
                        </div>
                    </>
                )}
                {details.attendeeType === "student" && (
                    <>
                        <div className="form-group mb-3 text-start">
                            <label htmlFor="institute" className="form-label">Institute<span className="text-danger">*</span></label>
                            <input
                                type="text"
                                id="institute"
                                name="institute"
                                value={(details as StudentDetails).institute}
                                onChange={handleChange}
                                maxLength={50}
                                required
                                className="form-control"
                                disabled={disabled}
                            />
                        </div>
                        <div className="form-group mb-3 text-start">
                            <label htmlFor="studyProgram" className="form-label">Study program<span className="text-danger">*</span></label>
                            <input
                                type="text"
                                id="studyProgram"
                                name="studyProgram"
                                value={(details as StudentDetails).studyProgram}
                                onChange={handleChange}
                                maxLength={50}
                                required
                                className="form-control"
                                disabled={disabled}
                            />
                        </div>
                        <div className="form-group mb-3 text-start">
                            <label htmlFor="graduationDate" className="form-label">Expected graduation date (<em>e.g. September 2026</em>)<span className="text-danger">*</span></label>
                            <input
                                type="month"
                                id="graduationDate"
                                name="graduationDate"
                                value={(details as StudentDetails).graduationDate}
                                onChange={handleChange}
                                required
                                className="form-control"
                                disabled={disabled}
                            />
                        </div>
                    </>
                )}
                {children}
            </div>
        </div>
    );
}