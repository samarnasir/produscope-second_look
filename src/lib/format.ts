const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

export const inr = (n: number) => `₹${nf.format(Math.round(n))}`

/** 155000 → "₹1.55 lakh" */
export const inrLakh = (n: number) => `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, '')} lakh`

export const months = (n: number) => `${n} ${n === 1 ? 'month' : 'months'}`

export const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
}
