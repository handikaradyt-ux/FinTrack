import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    message: 'Tipe transaksi wajib dipilih'
  }),
  amount: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return undefined
      return Number(val)
    },
    z.number({
      message: 'Jumlah transaksi wajib diisi'
    }).positive('Jumlah transaksi harus lebih dari 0')
  ),
  category_id: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return undefined
      return Number(val)
    },
    z.number({
      message: 'Kategori wajib dipilih'
    }).int('Kategori tidak valid').positive('Kategori wajib dipilih')
  ),
  transaction_date: z.string({
    message: 'Tanggal transaksi wajib diisi',
  })
    .trim()
    .min(1, 'Tanggal transaksi wajib diisi')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid (YYYY-MM-DD)')
    .refine((date) => {
      const parsed = Date.parse(date)
      return !isNaN(parsed)
    }, 'Tanggal tidak valid'),
  description: z.string().trim().nullable().optional()
})

export const updateTransactionSchema = transactionSchema.partial()
