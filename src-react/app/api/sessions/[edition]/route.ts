import { NextRequest, NextResponse } from 'next/server';
import { getSessionCatalog } from '@/src/lib/sessionize';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ edition: string }> }
) {
    const {edition} = await params;

    try {
        const sessions = await getSessionCatalog(edition);
        return NextResponse.json(sessions);
    } catch (error: any) {
        return NextResponse.json(
            { error: `Failed to fetch sessions: ${error.message}` },
            { status: 500 }
        );
    }
}
