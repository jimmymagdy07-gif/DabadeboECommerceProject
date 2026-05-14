export default function Footer() {
  return (
    <footer className="mt-16 border-t border-daba-pink/30 bg-daba-beige">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-stone-900">دباديبو</p>
          <p className="mt-1 max-w-md text-sm text-stone-600">
            هدايا بأسلوب ناعم، لحظات لا تُنسى. تابعنا على وسائل التواصل.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            className="rounded-full border border-daba-gold/40 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-daba-pink/30"
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
          >
            إنستغرام
          </a>
          <a
            className="rounded-full border border-daba-gold/40 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-daba-pink/30"
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
          >
            فيسبوك
          </a>
          <a
            className="rounded-full border border-daba-gold/40 bg-white px-4 py-2 font-semibold text-stone-800 hover:bg-daba-pink/30"
            href="https://tiktok.com"
            target="_blank"
            rel="noreferrer"
          >
            تيك توك
          </a>
        </div>
      </div>
      <div className="border-t border-daba-pink/20 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} دباديبو — صُنع بحب
      </div>
    </footer>
  );
}
