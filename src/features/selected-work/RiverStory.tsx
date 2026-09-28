import { riverBeats } from "./river-story";

export function RiverCopy() {
  return (
    <div className="river-copy">
      {riverBeats.map((beat, index) => (
        <div key={beat.id} data-river-beat={beat.id} hidden={index !== 0}>
          <p className="river-chapter">
            {String(index + 1).padStart(2, "0")} / {beat.label}
          </p>
          <p className="river-headline">{beat.title}</p>
          <p className="river-description">{beat.description}</p>
        </div>
      ))}
    </div>
  );
}
