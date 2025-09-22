'use client'

import React from "react";

interface PersonalDetailsFormProps {
    details: {
        firstName: string,
        lastName: string,
        company: string,
        role: string
    };
    setDetails: React.Dispatch<React.SetStateAction<{
        firstName: string,
        lastName: string,
        company: string,
        role: string
    }>>;
    disabled: boolean;
    children?: React.ReactNode;
}

const fields = [
    { name: "firstName", label: "First name", type: "text" },
    { name: "lastName", label: "Last name", type: "text" },
    { name: "company", label: "Company / Organization", type: "text" },
    { name: "role", label: "Your role or job title", type: "text" }
];

export default function PersonalDetailsForm({ details, setDetails, disabled, children }: PersonalDetailsFormProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    return (
        <div className="card h-100 shadow-sm mt-3">
            <div className="card-header text-center"><h3>Tell us a bit about yourself</h3></div>
            <div className="card-body text-center mx-5">
                {fields.map(field => (
                    <div className="form-group mb-3 text-start" key={field.name}>
                        <label htmlFor={field.name} className="form-label">{field.label}<span className="text-danger">*</span></label>
                        <input
                            type={field.type}
                            id={field.name}
                            name={field.name}
                            value={details[field.name as keyof typeof details]}
                            onChange={handleChange}
                            maxLength={50}
                            required
                            className="form-control"
                            disabled={disabled}
                        />
                    </div>
                ))}
                {children}
            </div>
        </div>
    );
}