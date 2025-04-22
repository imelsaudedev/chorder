import { Song, SongUnit, SongArrangement } from '@/generated/prisma'

export type SongArrangementWithUnits = SongArrangement & {
  units: SongUnit[]
}

export type SongWithArrangements = Song & {
  arrangements: SongArrangementWithUnits[]
}
