import React from "react";
import MainLayout from "@/src/components/layout/MainLayout";
import PastEditionSection from "@/src/components/sections/PastEditionsSection";
import { Suspense } from "react";

export const metadata = {
    title: "Past Editions | Bitbash"
};

export default function PastEditionsPage() {

    return (
        <MainLayout>
            <Suspense fallback={<div>Loading past editions...</div>}>
                <PastEditionSection />
            </Suspense>
        </MainLayout>
    );
}
