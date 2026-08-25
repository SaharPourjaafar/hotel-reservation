export function calculateNights(checkIn: Date, checkOut: Date): number {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / millisecondsPerDay,
  );
}
