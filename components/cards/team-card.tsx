import Image from "next/image"

interface TeamCardProps {
    image: string
    className?: string
}

export default function TeamCard({ image, className = "" }: TeamCardProps) {
    return (
        <div
            className={`relative w-full h-full flex items-end justify-center ${className}`}
        >
            <Image
                src={image}
                alt="Team member portrait"
                width={400}
                height={500}
                className="h-full w-auto object-contain grayscale"
                priority={false}
            />
        </div>
    )
}
