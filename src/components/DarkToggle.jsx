export default function DarkToggle() {
  function toggle() {
    document.documentElement.classList.toggle("dark");
  }

  return (
    <button
      onClick={toggle}
      className="fixed top-24 right-4 bg-gray-200 dark:bg-gray-800 px-3 py-2 rounded-full text-sm"
    >
      🌙
    </button>
  );
}
