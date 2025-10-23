'use client'
import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers, Contract } from "ethers";
import { Button, Form, Input, InputNumber, Space, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import UploadPage from '@/app/components/UploadImage';
import MyNFTABI from '../../abi/MyNFTModule#MyNFT.json';
import { NFT_CONTRACT_ADDRESS } from '@/app/constants';
import { onUploadJsonToPinata } from '@/utils';
import { useRouter } from 'next/navigation';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
}

// Callback function after uploading the image to pinata response data type
interface UploadResponse {
  cid: string,
  success: boolean,
  url: string,
}

// nft metadata type
interface NftMetadata {
  name: string,
  price: number,
  url: string,
  description: string,
  Traits: {
    trait_type: string,
    value: string,
  }[]
}


const AddNft = () => {
  const router = useRouter();
  const { user } = usePrivy() as any;
  const { wallet = {} } = user || {};
  const [messageApi] = message.useMessage();

  const [nftImageInfo, setNftImageInfo] = useState<UploadResponse>(); // nft image info

  // 提交nft信息，铸造nft
  const onSubmit = async (event: NftMetadata) => {
    if (!nftImageInfo) {
      // If the NFT image is not uploaded, minting will be terminated
      messageApi.open({
        type: 'error',
        content: 'please upload nft image',
      });
      return
    }
    // not connect wallet
    if (!wallet?.address || !window.ethereum) {
      messageApi.open({
        type: 'error',
        content: 'please login in again',
      });
      return
    }
    // wallet connect finished, and EVM Ok!
    const metadata = {
      image: `ipfs://${nftImageInfo.cid}`,
      ...event,
    }
    const { cid } = await onUploadJsonToPinata(metadata);
    // 1. 连接钱包
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // 请求授权
    const signer = await provider.getSigner();

    // 2. 初始化合约实例
    const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS,
      MyNFTABI.abi,
      signer
    );

    // 3. 调用铸造函数，传入目标地址
    const tx = await nftContract.safeMintToAddress(wallet.address, `ipfs://${cid}`);
    console.log("铸造交易已发送，哈希：", tx.hash);

    // 4. 等待交易确认（上链）
    await tx.wait();
    // 上链完成，跳转会 nft 列表
    router.replace('/nft')
  }

  return (
    <>
      <Form
        {...layout}
        name="nest-messages"
        onFinish={onSubmit}
        style={{ maxWidth: 1000 }}
      >
        <Form.Item label="NFT Image" valuePropName="fileList">
          <UploadPage feedback={(res: UploadResponse)=>{setNftImageInfo(res)}} />
        </Form.Item>
        <Form.Item name="name" label="name" rules={[{ required: true }]}>
          <Input placeholder='plase input the name of nft' />
        </Form.Item>
        <Form.Item name='price' label="Price" rules={[{ required: true }]}>
          <InputNumber placeholder='plase input the price of nft' />
        </Form.Item>
        <Form.Item name='url' label="url" rules={[{ required: true }]}>
          <Input placeholder='plase input the url of nft link external' />
        </Form.Item>

        <Form.Item name='description' label="description" rules={[{ required: true }]}>
          <Input.TextArea placeholder='plase input detail of the nft' />
        </Form.Item>
        <Form.Item label="Traits">
          <Form.List name="attributes">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'trait_type']}
                      rules={[{ required: true, message: 'Missing first name' }]}
                    >
                      <Input placeholder="First Name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'value']}
                      rules={[{ required: true, message: 'Missing last name' }]}
                    >
                      <Input placeholder="Last Name" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add field
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}

export default AddNft;