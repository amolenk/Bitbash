'use client'

import React, { useEffect, useRef } from 'react';

interface PhotoViewerProps {
    editionSlug: string;
    photoCount: number;
}

export default function PhotoViewer({
    editionSlug,
    photoCount,
}: PhotoViewerProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let mounted = true;

        function generatePhotoList({
            baseUrl,
            editionSlug,
            count
        }: {
            baseUrl: string;
            editionSlug: string;
            count: number;
        }) {
            return Array.from({ length: count }, (_, i) => {
                const idx = String(i + 1).padStart(3, '0');

                return {
                    thumb: `${baseUrl}/${editionSlug}/thumbnails/photo_${idx}_tn.jpg`,
                    image: `${baseUrl}/${editionSlug}/original/photo_${idx}.jpg`
                };
            });
        }

        async function init() {
            try {

                if (!mounted) return;

                const data = generatePhotoList({
                    baseUrl: 'https://bitbashphotos.blob.core.windows.net',
                    editionSlug: editionSlug,
                    count: photoCount
                });

                const selectorOrElement = containerRef.current || '.galleria';

                // run Galleria on the element (Galleria.run accepts selector or DOM element)
                (window as any).Galleria.run(selectorOrElement, {
                    dataSource: data,
                    imageCrop: true
                });
            } catch (err) {
                console.error('Galleria init error:', err);
            }
        }

        init();

        return () => {
            mounted = false;
            // try to destroy any running instance to avoid leaks
            try {
                const G = (window as any).Galleria;
                if (G && typeof G.get === 'function') {
                    const inst = G.get(0);
                    if (inst && typeof inst.destroy === 'function') {
                        inst.destroy();
                    }
                }
            } catch (e) {
                // ignore
            }
        };
    }, [editionSlug, photoCount]);

    return <div ref={containerRef} className={`galleria`} />;
}