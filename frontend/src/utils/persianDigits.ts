export function toPersianDigits(value: string | number): string {
  const str = String(value)
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return str.replace(/\d/g, (d) => persianDigits[parseInt(d, 10)])
}
