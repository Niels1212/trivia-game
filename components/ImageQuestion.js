import Image from "next/image";

export default function ImageQuestion({ imageSrc, altText }) {
  return (
    <div className="flex justify-center">
      <Image
        src={imageSrc} // ✅ Next.js requires absolute paths
        alt={altText}
        width={250} // ✅ Adjust size
        height={250}
        className="object-cover rounded-lg shadow-lg"
        priority // ✅ Ensures fast loading
      />
    </div>
  );
}