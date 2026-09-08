import { z } from 'zod'

export const budgetSchema = z.object({
  category_id: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return undefined
      return Number(val)
    },
    z.number({
      message: 'Kategori wajib dipilih'
    }).int('Kategori tidak valid').positive('Kategori wajib dipilih')
  ),
  amount: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return undefined
      return Number(val)
    },
    z.number({
      message: 'Nominal anggaran wajib diisi'
    }).positive('Nominal anggaran harus lebih dari 0')
  ),
  month: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return undefined
      return Number(val)
    },
    z.number({
      message: 'Bulan wajib dipilih',
    }).int().min(1).max(12, 'Bulan tidak valid')
  ),
  year: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return undefined
      return Number(val)
    },
    z.number({
      message: 'Tahun wajib diisi',
    }).int().positive('Tahun tidak valid')
  )
})

export const updateBudgetSchema = budgetSchema.partial()
