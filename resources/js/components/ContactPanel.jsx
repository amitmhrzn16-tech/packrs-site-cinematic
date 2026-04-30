export default function ContactPanel() {
  return (
    <div id="contact" className="glass p-5 grid grid-cols-2 gap-4">
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-white/50">Phone</div>
        <a href="tel:9801367205" className="font-display text-lg text-packrs-orange hover:underline">9801367205</a>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-white/50">Email</div>
        <a href="mailto:packrs24@gmail.com" className="font-display text-base hover:underline">packrs24@gmail.com</a>
      </div>
      <div className="col-span-2">
        <div className="text-[10px] uppercase tracking-[0.25em] text-white/50">HQ</div>
        <div className="text-sm text-white/80">Hadigaun · Kathmandu · Nepal</div>
      </div>
    </div>
  );
}
