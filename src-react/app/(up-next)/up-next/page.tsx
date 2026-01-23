export const dynamic = 'force-dynamic';

import {UpNextSection} from "@/src/components/sections/UpNextSection";
import {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Up Next | Bitbash"
};

export default async function UpNextPage() {

    return (
        <div>
            <UpNextSection/>
        </div>
    );
}
