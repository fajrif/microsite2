'use client'

import Image from 'next/image'

// Job titles for the scrolling marquee
const jobTitles = [
    'Software Engineer',
    'Database Administrator',
    'Field Operation',
    'Admin Officer',
    'IT Helpdesk',
    'Network Engineer',
    'Data Scientist',
    'Engineer On-Site',
    'Dev-Ops Specialist',
    'Project Manager',
    'Business Analyst',
    'Security Specialist',
]

export function HRManagementBackground() {
    return (
        <div className="flex h-full bg-black text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex-shrink-0 hidden lg:block" />

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                {/* Content */}
                <div className="px-8 py-6 mt-[5.5rem] border-t border-zinc-800">
                    {/* Portrait Images Section */}
                    <div className="mb-6 hidden md:block">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {/* Portrait Card 1 */}
                            <div className="group cursor-pointer">
                                <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-zinc-800">
                                    <Image
                                        src="/images/portrait/pic1.jpg"
                                        alt="Team member"
                                        fill
                                        className="object-cover grayscale group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            </div>

                            {/* Portrait Card 2 */}
                            <div className="group cursor-pointer">
                                <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-zinc-800">
                                    <Image
                                        src="/images/portrait/pic2.jpg"
                                        alt="Team member"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            </div>

                            {/* Portrait Card 3 */}
                            <div className="group cursor-pointer">
                                <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-zinc-800">
                                    <Image
                                        src="/images/portrait/pic3.jpg"
                                        alt="Team member"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            </div>

                            {/* Portrait Card 4 */}
                            <div className="group cursor-pointer">
                                <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-zinc-800">
                                    <Image
                                        src="/images/portrait/pic4.jpg"
                                        alt="Team member"
                                        fill
                                        className="object-cover grayscale group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Job Titles Scroller */}
                        <div className="relative overflow-hidden">
                            {/* Left Gradient Overlay */}
                            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                            {/* Right Gradient Overlay */}
                            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
                            {/* Scrolling Content */}
                            <div className="flex whitespace-nowrap">
                                <div className="animate-scroll flex gap-3 text-sm text-white/80">
                                    {/* Duplicate job titles for seamless scrolling */}
                                    {[...jobTitles, ...jobTitles].map((title, index) => (
                                        <span key={index} className="flex items-center gap-3">
                                            <span>{title}</span>
                                            <span>•</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Square Images Section */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 border-b border-zinc-800">
                        {/* Square Card 1 */}
                        <div className="group cursor-pointer">
                            <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-zinc-800">
                                <Image
                                    src="/images/square/pic1.jpg"
                                    alt="Project"
                                    fill
                                    className="object-cover grayscale group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>

                        {/* Square Card 2 */}
                        <div className="group cursor-pointer">
                            <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-zinc-800">
                                <Image
                                    src="/images/square/pic2.jpg"
                                    alt="Project"
                                    fill
                                    className="object-cover grayscale group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>

                        {/* Square Card 3 */}
                        <div className="group cursor-pointer">
                            <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-zinc-800">
                                <Image
                                    src="/images/square/pic3.jpg"
                                    alt="Project"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>

                        {/* Square Card 4 */}
                        <div className="group cursor-pointer">
                            <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-zinc-800">
                                <Image
                                    src="/images/square/pic4.jpg"
                                    alt="Project"
                                    fill
                                    className="object-cover group-hover:scale-105 grayscale brightness-50 md:grayscale-0 md:brightness-100 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Square Card 5 */}
                        <div className="group cursor-pointer">
                            <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-zinc-800">
                                <Image
                                    src="/images/square/pic5.jpg"
                                    alt="Project"
                                    fill
                                    className="object-cover grayscale group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>

                        {/* Square Card 6 */}
                        <div className="group cursor-pointer">
                            <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-zinc-800">
                                <Image
                                    src="/images/square/pic6.jpg"
                                    alt="Project"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* CSS for scroll animation */}
            <style jsx>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .animate-scroll {
                    animation: scroll 20s linear infinite;
                }
                .animate-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    )
}
