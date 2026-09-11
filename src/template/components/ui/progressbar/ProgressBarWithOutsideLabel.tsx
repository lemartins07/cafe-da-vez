export default function ProgressBarWithOutsideLabel() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative h-2 w-full rounded-sm bg-gray-200 sm:max-w-[281px] dark:bg-gray-800">
          <div className="absolute left-0 h-full w-[40%] rounded-sm bg-brand-500"></div>
        </div>

        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
          40%
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-2 w-full rounded-sm bg-gray-200 sm:max-w-[281px] dark:bg-gray-800">
          <div className="absolute left-0 h-full w-[70%] rounded-sm bg-brand-500"></div>
        </div>

        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
          70%
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-2 w-full rounded-sm bg-gray-200 sm:max-w-[281px] dark:bg-gray-800">
          <div className="absolute left-0 h-full w-[30%] rounded-sm bg-brand-500"></div>
        </div>

        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
          30%
        </span>
      </div>
    </div>
  );
}
