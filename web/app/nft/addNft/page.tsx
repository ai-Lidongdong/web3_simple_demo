'use client'
import React, { useState } from 'react';
import { Button, Form, Input, InputNumber, Space, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import UploadPage from '@/app/components/UploadImage';
import styles from "./page.module.css";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
}
interface UploadResponse {
  cid: string,
  success: boolean,
  url: string,
}


const Home = () => {
  const [nftImageInfo, setNftImageInfo] = useState<UploadResponse>(); // nft 图片信息
  const [messageApi] = message.useMessage();

  const onSubmit = (event: any) => {
    console.log('----------event', event);
    // const { metadata = [] } = event;
    if(!nftImageInfo) {
      messageApi.open({
        type: 'error',
        content: 'please upload nft image',
      });
      return 
    }
    const params = {
      cid: nftImageInfo?.cid,
      ...event,
    }
    console.log('----params', params)

  }
  const uploadImageBack = (res: any) => {
    setNftImageInfo(res)
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
          <UploadPage feedback={uploadImageBack} />
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

export default Home;