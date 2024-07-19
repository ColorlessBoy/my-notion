import SpaceCards from "./_components/SpaceCards";

export default function SpacesPage() {
  return (
    <>
      <div className="w-full font-extrabold text-3xl flex flex-col justify-center text-center mb-5">
        书架
      </div>
      <SpaceCards />
    </>
  );
}
