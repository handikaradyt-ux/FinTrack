import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string({
    message: 'Nama kategori wajib diisi',
  }).trim().min(1, 'Nama kategori tidak boleh kosong'),
  type: z.enum(['income', 'expense'], {
    message: 'Tipe kategori wajib dipilih'
  })
})

export const updateCategorySchema = categorySchema.partial()
