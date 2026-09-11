export default function ProgressBarWithInsideLabel() {
  return (
    <div className="w-full space-y-5 sm:max-w-[320px]">
      <div className="relative h-4 w-full rounded-full bg-gray-200 dark:bg-gray-800">
        <div className="absolute left-0 flex h-full w-[40%] items-center justify-center rounded-full bg-brand-500 text-[10px] leading-tight font-medium text-white">
          40%
        </div>
      </div>

      <div className="relative h-4 w-full rounded-full bg-gray-200 dark:bg-gray-800">
        <div className="absolute left-0 flex h-full w-[70%] items-center justify-center rounded-full bg-brand-500 text-[10px] leading-tight font-medium text-white">
          70%
        </div>
      </div>

      <div className="relative h-4 w-full rounded-full bg-gray-200 dark:bg-gray-800">
        <div className="absolute left-0 flex h-full w-[30%] items-center justify-center rounded-full bg-brand-500 text-[10px] leading-tight font-medium text-white">
          30%
        </div>
      </div>
    </div>
  );
}
