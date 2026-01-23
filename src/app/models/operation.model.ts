export type OperationV2 = {
  id: number;
  userId: number;
  montant: number;
  type: boolean;
  categorie: string;
  compteId: number;
  description1: string;
  description2?: string;
  operationDate: Date;
  solde: number;
  isTransfert: boolean;
  compteReceveur?: string;
  oldId?: string
}
