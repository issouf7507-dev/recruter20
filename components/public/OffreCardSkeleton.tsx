export function OffreCardSkeleton() {
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--y-bg-pure)", boxShadow: "inset 0 0 0 1px var(--y-line)" }}>
      <div className="flex gap-3.5 items-start">
        <div className="yl-skel w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="yl-skel h-3 w-2/5 rounded" />
          <div className="yl-skel h-5 w-3/4 rounded" />
        </div>
        <div className="yl-skel w-9 h-9 rounded-full shrink-0" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="yl-skel h-6 w-16 rounded-full" />
        <div className="yl-skel h-6 w-28 rounded-full" />
        <div className="yl-skel h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-between mt-4 pt-3.5" style={{ borderTop: "1px dashed var(--y-line-2)" }}>
        <div className="yl-skel h-3 w-20 rounded" />
        <div className="yl-skel h-3 w-16 rounded" />
      </div>
    </div>
  );
}
