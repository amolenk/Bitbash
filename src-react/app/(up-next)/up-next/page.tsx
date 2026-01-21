import {UpNextSection} from "@/src/components/sections/UpNextSection";
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
        <UpNextSection
            isTest={test || false}
            />
    );
}
