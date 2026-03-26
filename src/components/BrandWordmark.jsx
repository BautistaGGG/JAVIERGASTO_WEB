export default function BrandWordmark({
  className = '',
  subtitle = null,
  compact = false,
  textClassName = 'text-lg',
  subtitleClassName = 'text-[10px] text-zinc-400',
}) {
  return (
    <div className={className}>
      <span className={`font-bold text-zinc-100 leading-none block ${textClassName}`}>
        <span className="text-red-600">H</span>idráulica <span className="text-red-600">G</span>astó
      </span>
      {!compact && subtitle && (
        <span className={`leading-none ${subtitleClassName}`}>{subtitle}</span>
      )}
    </div>
  );
}
