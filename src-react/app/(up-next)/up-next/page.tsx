import {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Up Next | Bitbash"
};

export default async function UpNextPage({searchParams}: {
    searchParams: Promise<{ test?: boolean; }>
}) {

    const {test} = await searchParams;

    return (
        <div>
            <h1 className="text-light">Welcome to Bitbash 2026 🦕</h1>
            <h2 className="text-light">Current time is {new Date().toLocaleTimeString()}</h2>
        </div>
    );
}
