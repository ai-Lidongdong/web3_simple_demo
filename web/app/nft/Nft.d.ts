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
  Traits: {
    trait_type: string,
    value: string,
  }[]
}

export type NftMetadataList =  {
  tokenId: string | number,
  metadata: NftMetadata
}
