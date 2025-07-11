const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-[#129990]/20 border-t-[#129990] rounded-full animate-spin"></div>
      <div className="mt-4 text-center">
        <p className="text-[#129990] font-medium">Loading data...</p>
      </div>
    </div>
  </div>
);

export default LoadingSpinner;