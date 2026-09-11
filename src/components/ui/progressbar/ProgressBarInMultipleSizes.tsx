export default function ProgressBarInMultipleSizes() {
  return (
    <div className="w-full space-y-4 sm:max-w-[320px]">
      <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
        <div className="absolute left-0 h-full w-[55%] rounded-full bg-brand-500"></div>
      </div>

      <div className="relative h-3 w-full rounded-full bg-gray-200 dark:bg-gray-800">
        <div className="absolute left-0 h-full w-[55%] rounded-full bg-brand-500"></div>
      </div>

      <div className="relative h-4 w-full rounded-full bg-gray-200 dark:bg-gray-800">
        <div className="absolute left-0 h-full w-[55%] rounded-full bg-brand-500"></div>
      </div>

      <div className="relative h-5 w-full rounded-full bg-gray-200 dark:bg-gray-800">
        <div className="absolute left-0 h-full w-[55%] rounded-full bg-brand-500"></div>
      </div>
    </div>
  );
}
