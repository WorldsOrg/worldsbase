import Link from "next/link";

export function CallToAction() {
  return (
    <section
      id="get-started-today"
      className="relative py-32 overflow-hidden bg-secondary"
    >
      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl tracking-tight text-white font-display sm:text-4xl">
            Get started today
          </h2>
          <p className="mt-4 text-lg tracking-tight text-white">
            It’s time to take control of games. Try our software and see the
            difference it makes in your game.
          </p>
          <Link href="/auth">
            <button
              color="white"
              className="p-1 px-4 mt-10 bg-white rounded-full hover:bg-black hover:text-white"
            >
              Setup your dashboard in minutes
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
