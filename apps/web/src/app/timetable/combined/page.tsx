import mongoose from "mongoose";
import { CalendarConfig, Offering, Course } from "@weir-here/shared"; // adjust import path if needed
import { connectDb } from "../../../../lib/db/mongoose"; // adjust relative path

// Helper types
type OfferingWithCourse = Offering & { course: Course };

async function getCombinedData() {
  await connectDb();
  // Fetch calendar config (assume one per school)
  const calendar = await CalendarConfig.findOne({}).lean();
  if (!calendar) throw new Error("Calendar config not found");

  // Fetch all offerings for both segments for the current semester (example S1)
  const offerings = await Offering.find({ semesterKey: { $in: ["S1", "S2"] } })
    .populate("courseId")
    .lean();

  // Organise by day and slot
  const grid: Record<number, Record<number, { hs?: OfferingWithCourse; ls?: OfferingWithCourse }>> = {};
  for (const o of offerings as any[]) {
    const dayIndices = o.workDayIndices as number[];
    const slot = o.slotIndex as number;
    const segment = o.timetableSegment ?? "hs";
    for (const day of dayIndices) {
      if (!grid[day]) grid[day] = {};
      if (!grid[day][slot]) grid[day][slot] = {};
      const target = segment === "ls" ? "ls" : "hs";
      grid[day][slot][target] = { ...o, course: o.courseId };
    }
  }

  return { calendar, grid };
}

export default async function CombinedTimetablePage() {
  const { calendar, grid } = await getCombinedData();

  // Determine days and slots order
  const days = calendar.lowerSchoolWorkDayIndices?.length ? calendar.lowerSchoolWorkDayIndices : calendar.workDayIndices;
  const slots = calendar.lowerSchoolSlotTemplates?.length ? calendar.lowerSchoolSlotTemplates : calendar.slotTemplates;

  return (
    <div className="p-4 overflow-auto">
      <h1 className="text-2xl font-bold mb-4">Combined HS / LS Timetable</h1>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Day / Period</th>
            {slots?.map((slot) => (
              <th key={slot.index} className="border p-2">
                {slot.label}<br />{slot.start} – {slot.end}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days?.map((day) => (
            <tr key={day}>
              <td className="border p-2 font-medium">Day {day + 1}</td>
              {slots?.map((slot) => {
                const cell = grid[day]?.[slot.index];
                return (
                  <td key={slot.index} className="border p-2 align-top">
                    {cell?.hs && (
                      <div className="bg-blue-100 p-1 mb-1 rounded">
                        <strong>HS:</strong> {cell.hs.course?.code} {cell.hs.course?.title}
                      </div>
                    )}
                    {cell?.ls && (
                      <div className="bg-green-100 p-1 rounded">
                        <strong>LS:</strong> {cell.ls.course?.code} {cell.ls.course?.title}
                      </div>
                    )}
                    {!cell && <span className="text-gray-500">—</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
