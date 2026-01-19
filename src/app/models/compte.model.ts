export type CompteV2 = {
  id: string;
  name: string;
  typeCompte: string;
  soldeInitial: number;
  soldeActuel: number;
  userId?: number;
  isDeleted?: boolean
  oldId?: string
}
