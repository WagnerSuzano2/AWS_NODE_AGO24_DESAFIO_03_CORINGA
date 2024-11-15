export function formatPlate(plate: string) {
  return plate.trim().replace(/-/g, '').toUpperCase();
}
