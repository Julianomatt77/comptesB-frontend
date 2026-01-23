export type CompteV2 = {
  id: number;
  name: string;
  typeCompte: string;
  soldeInitial: number;
  soldeActuel: number;
  userId?: number;
  isDeleted?: boolean
  oldId?: string
}
