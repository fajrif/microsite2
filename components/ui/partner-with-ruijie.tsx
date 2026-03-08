'use client'

import Image from 'next/image'

export const PartnerWithRuijie = () => {
    return (
        <div className="w-full py-4">
            <a
                href="https://www.ruijie.com/en-global/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-opacity"
            >
                <Image
                    src="/images/ruijie.svg"
                    alt="Ruijie Networks"
                    width={120}
                    height={36}
                />
            </a>
        </div>
    )
}
