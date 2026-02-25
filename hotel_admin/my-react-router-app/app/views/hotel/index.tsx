import { Button, Form, Input, Table, Tag, Space, Card, Select, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { GetProp, TableProps } from 'antd';
import React, { useEffect, useState } from 'react';
import storage from '../../utils/storage';
import type { SorterResult } from 'antd/es/table/interface';
import type { HotelListParams, HotelParams, HotelRoomParams } from '~/types/api';
import { useHotelFilter } from './hooks/useHotelFilter';
import api from '../../api';
import styles from './index.module.less';
import EditHotel from './EditHotel';
import EditRoom from './EditRoom';
import RejectHotel from './RejectHotel';

type ColumnsType<T extends object = object> = TableProps<T>['columns'];

type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;


interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: {hotelName?: string;status?: number | null;};
}



export default function HotelCon(){
    const userInfo = storage.get('role')as any;
    const userId = storage.get('userId') as any;
    const username = storage.get('username') as any;
    const [loadingRowId, setLoadingRowId] = useState<string[]>([]);
    // --- 房间表格的列定义 ---
    const roomColumns: ColumnsType<any> = [
        { title: '房间名称', dataIndex: 'roomName', key: 'roomName' },
        { 
            title: '价格', 
            dataIndex: 'roomPrice', 
            key: 'roomPrice', 
            render: (text) => <span style={{ color: '#f50' }}>￥{text}</span> 
        },
        { title: '可住人数', dataIndex: 'number', key: 'number' },
        {
            title: '设施',
            key: 'facilities',
            render: (_, record) => (
                <Space>
                    {record.hasTV && <Tag color="orange">电视</Tag>}
                    {record.hasWifi && <Tag color="blue">WiFi</Tag>}
                    {record.hasWindow && <Tag color="green">有窗</Tag>}
                    {record.hasBathtub && <Tag color="purple">浴缸</Tag>}
                </Space>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => handleEditRoom('edit',{hotelId:record.hotelId,roomId:record.id})}>编辑</Button>
                </Space>
            ),
        }
    ];
    // --- 展开行的渲染函数 ---
    const expandedRowRender = (record: any) => {
        // 如果该行正在加载
        if (loadingRowId.includes(record._id)) {
            return (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin tip="正在读取房间详情..." />
                </div>
            );
        }
        // 如果加载完后依然没有房间数据
        if (!record.hotelRoom || record.hotelRoom.length === 0) {
            return <div style={{ padding: '20px', color: '#999' }}>该酒店目前没有登记房间</div>;
        }
        return (
            <Table
                columns={roomColumns}
                dataSource={record.hotelRoom}
                pagination={false}
                rowKey="id"
                size="small"
                bordered
            />
        );
    };
    // --- 处理展开动作 ---
    const handleExpand = async (expanded: boolean, record: any) => {
        // 只有在“展开”操作 且 “该行还没有详情数据”时才请求
        if (expanded && !record.hotelRoom) {
            setLoadingRowId(prev => [...prev, record._id]);
            try {
                // 调用详情接口
                const res = await api.getHotel({hotelId: record._id});
                const fullDetail = res; 
                // 将详情存入整个列表的 state 中，触发局部刷新
                setDisplayData(prevList => {
                    return prevList.map(item => {
                        if (item._id === record._id) {
                            return { ...item, ...fullDetail }; // 把后端返回的所有字段塞进去
                        }
                        return item;
                    });
                });
            } catch (error) {
                console.error("加载详情失败:", error);
            } finally {
                setLoadingRowId(prev => prev.filter(id => id !== record._id));
            }
        }
    };
    const columns: ColumnsType<HotelListParams> = [
        {
            title: '酒店名称',
            dataIndex: 'hotelName',
            sorter: true,
            width: '20%',
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: '20%',
            render: (status: number) => {
            let color = 'blue';
            let text = '待审核';
            if (status === 1) { color = 'green'; text = '已发布'; }
            if (status === 2) { color = 'orange'; text = '未通过'; }
            if (status === 3) { color = 'red'; text = '已下线'; }
            return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
            <Space size="middle">
                {/* record 代表当前这一行的数据对象 */}
                <Button type="link" onClick={() => handleEditRoom('create',{hotelId:record.hotelId})}>
                新增房间
                </Button>
                <Button type="link" onClick={() =>handleEdit(record._id)}>
                编辑
                </Button>
                {
                userInfo === 'admin' && 
                (
                <Button danger onClick={() => handleReject(record._id)}>不通过</Button>
                )}
            </Space>
            ),
        },
    ];
    const [form] = Form.useForm();   
    const [allData, setAllData] = useState<HotelListParams[]>([]);
    const [displayData, setDisplayData] = useState<HotelListParams[]>([]);  // 过滤后显示的数据
    const [loading, setLoading] = useState(false);
    const { onSearchChange, onStatusChange, handleReset } = useHotelFilter(
        form, 
        allData, 
        setDisplayData
    );
    const hotelRef = useState<{
        openModal: (type: string,data?:any,parentId?: string) => void 
    }>(null);
    const roomRef = useState<{ openModal: (type: string, data: any) => void }>(null);
    const rejectRef = useState<{ openModal: (data: any) => void }>(null);
    useEffect(() => {
        getHotelList();
    }, []);
    const getHotelList = async () => {
        setLoading(true);
        try {
            const params = form.getFieldsValue();
            if (userInfo === 'merchant') {
            // 如果是商家，只查属于自己的酒店
            params.userId = userId; 
            console.log('商家查询参数:', params);
            }
            params.userId = userId; 
            console.log('查询参数:', params);
            const res = await api.getHotelList(params);
            setAllData(res);
            setDisplayData(res);
        } catch (error) {
            // 拦截器已经处理了 message.error，这里只需要停止 loading
        } finally {
            setLoading(false);
        }
    };
    const handleEdit = (id:string) => {
        console.log('Edit hotel with ID:', id);
        hotelRef.current?.openModal('create',{parentId:id});
    }
    const handleEditRoom = (type: string,data: { hotelId: string, roomId: string }) => {
        console.log('Edit room with data:', data);
        roomRef.current?.openModal(type,data);
    }
    const handleReject = async (id: string) => {
        console.log('Reject hotel with ID:', id);
        rejectRef.current?.openModal({parentId:id});
    }
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
        }
    });
    const handleTableChange: TableProps<HotelListParams>['onChange'] = (pagination) => {
    setTableParams({
        ...tableParams,
        pagination,
    });
};
    return (
        <div className={styles.hotel}>
            <Card style={{ marginBottom: 16 }}>
                <Form form={form} layout="inline">
                    <Space size="large">
                        <Form.Item name="hotelName" label="酒店名称">
                            <Input.Search 
                                placeholder="请输入酒店名" 
                                onSearch={onSearchChange} 
                                allowClear
                                style={{ width: 200 }} 
                            />
                        </Form.Item>
                        
                        <Form.Item name="status" label="审核状态">
                            <Select
                                placeholder="选择状态"
                                style={{ width: 120 }}
                                onChange={onStatusChange}
                                allowClear
                                options={[
                                    { value: 0, label: '待审核' },
                                    { value: 1, label: '已发布' },
                                    { value: 2, label: '未通过' },
                                    { value: 3, label: '已下线' },
                                    
                                ]}
                            />
                        </Form.Item>
                        <Button type="primary" onClick={handleReset}>
                            重置
                        </Button>
                    </Space>
                </Form>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => {hotelRef.current?.openModal('create')}}
                    style={{ marginTop: 16 }}>
                    新增酒店
                </Button>
            </Card>

            <Table<HotelListParams>
            columns={columns}
            rowKey={(record) => record._id}
            dataSource={displayData}
            pagination={tableParams.pagination}
            loading={loading}
            onChange={handleTableChange}
            expandable={{
                    expandedRowRender,
                    onExpand: handleExpand, // 关键：监听展开动作
                }}
            />
            <EditHotel mref={hotelRef} />
            <EditRoom mref={roomRef} updateSuccess={getHotelList} />
            <RejectHotel mref={rejectRef} updateSuccess={getHotelList} />
        </div>
    )
}