import MapArea from "@/components/MapArea";
import BottomSheet from "@/components/BottomSheet";

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-gray-900 overscroll-none">
      <div className="absolute top-0 w-full h-[60%]">
        {/* We make Map Area slightly larger than 40% so it hides under bottom sheet for smooth visual overlaps */}
        <MapArea />
      </div>
      <BottomSheet />
    </main>
  );
}
