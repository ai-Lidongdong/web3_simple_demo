export type UploadResponse = {
  cid: string,
  success: boolean,
  url: string,
}

// nft metadata type
export type NFTMetadataRes =  {
  name: string,
  price: number,
  url: string,
  description: string,
  image: string,
  external_url?: string,
  attributes: {
    trait_type: string,
    value: string,
  }[]
}

export type OrderValuesRes = {
  orderId: string,
  seller: string,
  buyer: string,
  nftContract: string,
  tokenId: string,
  cid: string,
  price: string,
  paymentToken: string,
  isActive: boolean,
  isEscrowed: boolean,
  status: string,
  createdAt: number | undefined,
  updatedAt: number | undefined,
}

export type NftMetadataList =  {
  tokenId: string | number,
  metadata: NftMetadata
}
